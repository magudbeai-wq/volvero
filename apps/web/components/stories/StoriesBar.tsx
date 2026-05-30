'use client';

import { useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Plus, X, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api/client';
import { useAppStore } from '@/lib/store/appStore';

interface Story {
  id: string;
  mediaUrl: string;
  caption?: string;
  duration: number;
  viewCount: number;
  createdAt: string;
}

interface StoryGroup {
  user: {
    id: string;
    fullName: string;
    profilePhoto?: string;
    isVerified: boolean;
    isOnline: boolean;
  };
  stories: Story[];
}

export default function StoriesBar() {
  const [activeGroup, setActiveGroup] = useState<StoryGroup | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { user } = useAppStore();

  const { data } = useQuery({
    queryKey: ['stories'],
    queryFn: () => api.get('/api/stories').then(r => r.data),
    refetchInterval: 30000,
  });

  const storyGroups: StoryGroup[] = data?.stories || [];

  const openStory = (group: StoryGroup) => {
    setActiveGroup(group);
    setActiveIndex(0);
  };

  const closeStory = () => {
    setActiveGroup(null);
    setActiveIndex(0);
  };

  const nextStory = () => {
    if (!activeGroup) return;
    if (activeIndex < activeGroup.stories.length - 1) {
      setActiveIndex(prev => prev + 1);
    } else {
      // Go to next group
      const idx = storyGroups.indexOf(activeGroup);
      if (idx < storyGroups.length - 1) {
        setActiveGroup(storyGroups[idx + 1]);
        setActiveIndex(0);
      } else {
        closeStory();
      }
    }
  };

  const prevStory = () => {
    if (activeIndex > 0) {
      setActiveIndex(prev => prev - 1);
    }
  };

  return (
    <>
      {/* Stories bar */}
      <div className="flex gap-3 px-4 py-4 overflow-x-auto no-scrollbar">
        {/* Add story */}
        <button className="flex-shrink-0 flex flex-col items-center gap-1.5" onClick={() => {}}>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
            style={{ background: 'rgba(255,255,255,0.06)', border: '2px dashed rgba(139,92,246,0.4)' }}
          >
            <Plus className="w-6 h-6" style={{ color: '#a78bfa' }} />
          </div>
          <span className="text-[10px] font-medium" style={{ color: '#6b7280' }}>Add Story</span>
        </button>

        {/* Story avatars */}
        {storyGroups.map((group) => {
          const isOwn = group.user.id === user?.id;
          return (
            <button
              key={group.user.id}
              onClick={() => openStory(group)}
              className="flex-shrink-0 flex flex-col items-center gap-1.5"
            >
              <div
                className="w-16 h-16 rounded-2xl overflow-hidden p-0.5"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #2563eb, #ec4899)',
                }}
              >
                <div className="w-full h-full rounded-[14px] overflow-hidden">
                  {group.user.profilePhoto ? (
                    <Image
                      src={group.user.profilePhoto}
                      alt={group.user.fullName}
                      width={60}
                      height={60}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: 'linear-gradient(135deg, #1a0a2e, #0d1b4b)' }}>
                      {group.user.fullName.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[10px] font-medium truncate max-w-[64px]" style={{ color: '#9ca3af' }}>
                {isOwn ? 'Your Story' : group.user.fullName.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Full-screen story viewer */}
      <AnimatePresence>
        {activeGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.95)' }}
          >
            {/* Close */}
            <button onClick={closeStory} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
              <X className="w-5 h-5" />
            </button>

            {/* Progress bars */}
            <div className="absolute top-4 left-4 right-16 flex gap-1 z-10">
              {activeGroup.stories.map((_, i) => (
                <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.3)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'white' }}
                    initial={{ width: i < activeIndex ? '100%' : '0%' }}
                    animate={{ width: i <= activeIndex ? '100%' : '0%' }}
                    transition={i === activeIndex ? { duration: activeGroup.stories[i].duration, ease: 'linear' } : { duration: 0 }}
                    onAnimationComplete={() => {
                      if (i === activeIndex) nextStory();
                    }}
                  />
                </div>
              ))}
            </div>

            {/* User info */}
            <div className="absolute top-10 left-4 flex items-center gap-3 z-10">
              <div className="w-8 h-8 rounded-lg overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
                {activeGroup.user.profilePhoto ? (
                  <Image src={activeGroup.user.profilePhoto} alt="" width={32} height={32} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                    {activeGroup.user.fullName.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <div className="text-white text-sm font-semibold">{activeGroup.user.fullName}</div>
                <div className="text-[10px] flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <Eye className="w-3 h-3" />
                  {activeGroup.stories[activeIndex]?.viewCount || 0} views
                </div>
              </div>
            </div>

            {/* Story content */}
            <div className="relative w-full h-full max-w-lg mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={activeGroup.stories[activeIndex]?.mediaUrl || ''}
                    alt="Story"
                    fill
                    className="object-contain"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Caption */}
              {activeGroup.stories[activeIndex]?.caption && (
                <div className="absolute bottom-20 left-4 right-4 text-center">
                  <p className="text-white text-sm font-medium px-4 py-2 rounded-2xl inline-block"
                    style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
                    {activeGroup.stories[activeIndex].caption}
                  </p>
                </div>
              )}

              {/* Tap zones */}
              <button onClick={prevStory} className="absolute left-0 top-0 w-1/3 h-full z-5" />
              <button onClick={nextStory} className="absolute right-0 top-0 w-2/3 h-full z-5" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
