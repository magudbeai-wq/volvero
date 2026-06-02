import OpenAI from 'openai';
import { prisma } from '../lib/prisma.js';
import { getIo, getConnectedUsers } from '../socket/chat.js';
import { logger } from '../utils/logger.js';

let _openai: OpenAI | null = null;
function getOpenAI() {
  if (!_openai && process.env.OPENAI_API_KEY) {
    _openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    });
  }
  return _openai;
}

const FALLBACK_REPLIES = [
  "Hey! How is your day going? 😊",
  "Nice to match with you! What are you up to today?",
  "Hey! I\'m doing good, just busy with work. How about you?",
  "Haye! Sidee tahay? Maanta ma nabad baa?",
  "Aad baad u mahadsantahay! Sidee tahay maanta?",
  "I\'d love to get to know you better. Tell me more about yourself!",
  "Sorry, I prefer texting first before doing audio or video calls. Let\'s chat here! 😉",
];

export async function handleBotReply(conversationId: string, senderId: string, content: string) {
  try {
    // 1. Fetch conversation details and participants
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        userA: true,
        userB: true,
      },
    });

    if (!conversation) return;

    // Sender of the message (real user) and recipient (potential bot)
    const user = conversation.userAId === senderId ? conversation.userA : conversation.userB;
    const bot = conversation.userAId === senderId ? conversation.userB : conversation.userA;

    // Check if recipient is a bot
    if (!bot.email?.endsWith('@bot.velora.com')) {
      return;
    }

    const io = getIo();
    const userSocketId = getConnectedUsers().get(senderId);

    // 2. Simulate typing indicator (starts immediately)
    if (io && userSocketId) {
      io.to(userSocketId).emit('typing:update', {
        conversationId,
        userId: bot.id,
        isTyping: true,
      });
    }

    // 3. Generate response using OpenAI (if key is set) or fallback
    let replyText = '';
    const openai = getOpenAI();

    if (openai) {
      try {
        const prompt = `
          You are ${bot.fullName}, a ${(bot.gender || 'FEMALE').toLowerCase()} dating app user.
          Your Profile details:
          - Location: ${bot.city}, ${bot.country}
          - Career: ${bot.career}
          - Bio: ${bot.bio}
          - Language: ${bot.languages.join(', ')}

          The real user chatting with you is ${user.fullName} (${(user.gender || 'MALE').toLowerCase()}).
          User bio: ${user.bio || 'Not provided'}
          
          User said: "${content}"

          Instructions:
          - Reply naturally as a young Somali dating app user.
          - If the user wrote in Somali, you MUST reply in Somali. If they wrote in English, reply in English.
          - Be conversational, friendly, and brief (maximum 2 short sentences).
          - CRITICAL: You CANNOT accept or make audio/video calls. If they ask to call, politely make a fun excuse or say you prefer to text first (e.g. "I prefer to text first to get to know you!").
        `;

        const model = process.env.OPENAI_MODEL || 'gpt-4o';
        const response = await openai.chat.completions.create({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
          temperature: 0.8,
        });

        replyText = response.choices[0]?.message?.content?.trim() || '';
      } catch (err) {
        logger.error({ err }, 'OpenAI bot generation error, using fallback');
      }
    }

    // If OpenAI failed or key is missing, select a realistic fallback
    if (!replyText) {
      const isCallRequest = /\b(call|video|vedio|phone|num|number|hadal|wac)\b/i.test(content);
      if (isCallRequest) {
        replyText = "Sorry, I prefer to text first and get to know each other here! 😉";
      } else {
        replyText = FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
      }
    }

    // 4. Simulate typing delay (2-4 seconds) and send message
    const delay = 2000 + Math.random() * 2000;
    setTimeout(async () => {
      try {
        // Create bot message in DB
        const botMessage = await prisma.message.create({
          data: {
            conversationId,
            senderId: bot.id,
            content: replyText,
            type: 'TEXT',
          },
          include: {
            sender: {
              select: { id: true, fullName: true, profilePhoto: true },
            },
          },
        });

        // Update conversation last message details
        await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            lastMessage: replyText,
            lastMsgAt: new Date(),
          },
        });

        // Stop typing indicator and send message to socket
        if (io && userSocketId) {
          io.to(userSocketId).emit('typing:update', {
            conversationId,
            userId: bot.id,
            isTyping: false,
          });
          io.to(userSocketId).emit('message:received', {
            message: botMessage,
            conversationId,
          });
        }
      } catch (err) {
        logger.error({ err }, 'Failed to process bot message delivery');
      }
    }, delay);

  } catch (error) {
    logger.error({ error }, 'Failed to handle bot reply');
  }
}
