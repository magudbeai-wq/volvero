'use client';

import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Plus, X, Eye, Upload, Loader2, Sparkles } from 'lucide-react';
import { api } from '@/lib/api/client';
import { useAppStore } from '@/lib/store/appStore';
import toast from 'react-hot-toast';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAppStore();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['stories'],
    queryFn: () => api.get('/api/stories').then(r => r.data),
    refetchInterval: 30000,
  });

  const storyGroups: StoryGroup[] = data?.stories || [];

  const openStory = (group: StoryGroup) => {
    setActiveGroup(group);
    setActiveIndex(0);
    
    // Record view for the first story
    if (group.stories[0]) {
      api.post(`/api/stories/${group.stories[0].id}/view`).catch(() => {});
    }
  };

  const closeStory = () => {
    setActiveGroup(null);
    setActiveIndex(0);
  };

  const nextStory = () => {
    if (!activeGroup) return;
    if (activeIndex < activeGroup.stories.length - 1) {
      const nextIdx = activeIndex + 1;
      setActiveIndex(nextIdx);
      // Record view for next story
      if (activeGroup.stories[nextIdx]) {
        api.post(`/api/stories/${activeGroup.stories[nextIdx].id}/view`).catch(() => {});
      }
    } else {
      // Go to next group
      const idx = storyGroups.findIndex(g => g.user.id === activeGroup.user.id);
      if (idx < storyGroups.length - 1) {
        openStory(storyGroups[idx + 1]);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be smaller than 10MB');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAddStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Uploading story to ImageKit...');

    try {
      // 1. Get secure ImageKit upload parameters
      const authRes = await api.get('/api/upload/imagekit-auth');
      const { token, expire, signature, publicKey, urlEndpoint } = authRes.data;

      // 2. Prepare Form Data for direct upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('fileName', `story_${user?.id || 'unknown'}_${Date.now()}.jpg`);
      formData.append('publicKey', publicKey);
      formData.append('signature', signature);
      formData.append('expire', expire.toString());
      formData.append('token', token);
      formData.append('useUniqueFileName', 'true');
      formData.append('folder', '/stories');

      // 3. Post directly to ImageKit CDN API
      const uploadRes = await fetch(`https://upload.imagekit.io/api/v1/files/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('ImageKit direct upload failed');
      }

      const uploadData = await uploadRes.json();
      const mediaUrl = uploadData.url;

      // 4. Create Story record in Database
      toast.loading('Publishing story...', { id: toastId });
      await api.post('/api/stories', {
        mediaUrl,
        caption,
        duration: 5,
      });

      toast.success('Story published successfully! Active for 24 hours.', { id: toastId });
      
      // Reset State
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption('');
      setIsModalOpen(false);

      // Invalidate query to refresh Stories Bar
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    } catch (err) {
      console.error(err);
      toast.error('Failed to publish story. Please try again.', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* Stories bar */}
      <div className="flex gap-3 px-4 py-4 overflow-x-auto no-scrollbar">
        {/* Add story button */}
        <button 
          className="flex-shrink-0 flex flex-col items-center gap-1.5" 
          onClick={() => setIsModalOpen(true)}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center relative transition-transform duration-300 hover:scale-105"
            style={{ 
              background: 'rgba(19, 26, 43, 0.6)', 
              border: '2px dashed rgba(124, 58, 237, 0.4)',
              boxShadow: 'inset 0 0 12px rgba(124, 58, 237, 0.1)'
            }}
          >
            <Plus className="w-6 h-6" style={{ color: '#a78bfa' }} />
          </div>
          <span className="text-[10px] font-medium text-slate-400">Add Story</span>
        </button>

        {/* Story avatars */}
        {storyGroups.map((group) => {
          const isOwn = group.user.id === user?.id;
          return (
            <button
              key={group.user.id}
              onClick={() => openStory(group)}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 transition-transform duration-300 hover:scale-105"
            >
              <div
                className="w-16 h-16 rounded-2xl overflow-hidden p-[2px]"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #EC4899, #FBBF24)',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)'
                }}
              >
                <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-900">
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

      {/* Add Story Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(11, 16, 32, 0.85)', backdropFilter: 'blur(12px)' }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md rounded-3xl p-6 relative border border-purple-500/20"
              style={{ background: 'rgba(19, 26, 43, 0.9)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                disabled={isUploading}
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-xl font-bold text-white">Create a Story</h3>
              </div>

              <form onSubmit={handleAddStory} className="space-y-4">
                {/* File picker dropzone */}
                <div 
                  onClick={!isUploading ? triggerFileInput : undefined}
                  className={`w-full aspect-[9/16] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer relative overflow-hidden transition-all duration-300 ${
                    previewUrl ? 'border-purple-500' : 'border-slate-700 hover:border-purple-500/50 bg-slate-950/40'
                  }`}
                >
                  {previewUrl ? (
                    <>
                      <Image 
                        src={previewUrl} 
                        alt="Story preview" 
                        fill 
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="absolute bottom-4 right-4 bg-red-500/80 p-2 rounded-full text-white hover:bg-red-600 transition-colors"
                        disabled={isUploading}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6 text-purple-400" />
                      </div>
                      <p className="text-sm font-semibold text-white">Choose Story Image</p>
                      <p className="text-xs text-slate-400">Supports JPG, PNG, WEBP up to 10MB</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden" 
                    accept="image/*"
                    disabled={isUploading}
                  />
                </div>

                {/* Caption input */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Caption (Optional)</label>
                  <input 
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Add an inspiring caption..."
                    maxLength={100}
                    disabled={isUploading}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="w-full h-12 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                  }}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Uploading to ImageKit...</span>
                    </>
                  ) : (
                    <span>Publish Story</span>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
