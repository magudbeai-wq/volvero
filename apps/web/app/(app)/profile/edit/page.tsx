'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  ArrowLeft, Camera, Save, X, Plus, Trash2, GripVertical, Loader2
} from 'lucide-react';
import { api } from '@/lib/api/client';
import {
  INTERESTS, LANGUAGES, PERSONALITY_TRAITS, LIFESTYLE_PREFS
} from '@/lib/utils';
import toast from 'react-hot-toast';
import { useCurrentUser } from '@/lib/hooks/useAuth';

export default function EditProfilePage() {
  const router = useRouter();
  const user = useCurrentUser();

  const { data, isLoading } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => api.get('/api/users/me').then(r => r.data),
  });

  const profile = data?.user;

  const [form, setForm] = useState<Record<string, unknown>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Initialize form from profile
  const initForm = (p: Record<string, unknown>) => {
    if (Object.keys(form).length > 0) return;
    setForm({
      fullName: p.fullName || '',
      bio: p.bio || '',
      city: p.city || '',
      country: p.country || '',
      career: p.career || '',
      height: p.height || '',
      interests: p.interests || [],
      languages: p.languages || [],
      personalityTraits: p.personalityTraits || [],
      lifestylePrefs: p.lifestylePrefs || [],
      lookingFor: p.lookingFor || '',
      educationLevel: p.educationLevel || '',
      smokingStatus: p.smokingStatus || '',
      exerciseFrequency: p.exerciseFrequency || '',
      dietaryPrefs: p.dietaryPrefs || '',
      photos: p.photos || [],
      profilePhoto: p.profilePhoto || '',
      voiceIntroUrl: p.voiceIntroUrl || '',
      introVideoUrl: p.introVideoUrl || '',
    });
  };

  if (profile && Object.keys(form).length === 0) initForm(profile);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  const saveMutation = useMutation({
    mutationFn: (updates: Record<string, unknown>) =>
      api.patch('/api/users/me', updates).then(r => r.data),
    onSuccess: () => {
      toast.success('Profile saved! 💜');
      setIsDirty(false);
      router.push('/profile');
    },
    onError: () => toast.error('Failed to save profile'),
  });

  const update = (field: string, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const toggleArrayItem = (field: string, item: string, max = 10) => {
    const arr = (form[field] as string[]) || [];
    const next = arr.includes(item)
      ? arr.filter(i => i !== item)
      : [...arr, item].slice(0, max);
    update(field, next);
  };

  const handleSlotClick = (index: number) => {
    setActiveSlot(index);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeSlot === null) return;

    // Reset input
    e.target.value = '';

    const formData = new FormData();
    formData.append('photo', file);

    setUploadingSlot(activeSlot);
    const toastId = toast.loading('Uploading photo...');

    try {
      const res = await api.post('/api/upload/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { url } = res.data;
      const currentPhotos = [...((form.photos as string[]) || [])];
      
      // Place in the correct slot or append
      if (activeSlot < currentPhotos.length) {
        currentPhotos[activeSlot] = url;
      } else {
        currentPhotos.push(url);
      }

      const updatedPhotos = currentPhotos.slice(0, 9);
      update('photos', updatedPhotos);

      // If it's the first photo, set as profilePhoto
      if (activeSlot === 0 || !form.profilePhoto) {
        update('profilePhoto', url);
      }

      toast.success('Photo uploaded successfully! 📸', { id: toastId });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.', { id: toastId });
    } finally {
      setUploadingSlot(null);
      setActiveSlot(null);
    }
  };

  const handleDeletePhoto = (index: number) => {
    const currentPhotos = ((form.photos as string[]) || []).filter((_, idx) => idx !== index);
    update('photos', currentPhotos);

    // If we deleted the main photo, update profilePhoto to the new first photo
    if (index === 0 || form.profilePhoto === ((form.photos as string[]) || [])[index]) {
      update('profilePhoto', currentPhotos[0] || '');
    }
  };

  const handleSetMainPhoto = (index: number) => {
    const currentPhotos = [...((form.photos as string[]) || [])];
    if (index === 0 || index >= currentPhotos.length) return;

    // Swap index 0 and target index
    const temp = currentPhotos[0];
    currentPhotos[0] = currentPhotos[index];
    currentPhotos[index] = temp;

    update('photos', currentPhotos);
    update('profilePhoto', currentPhotos[0]);
    toast.success('Main profile photo updated!');
  };

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#8b5cf6' }} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 sticky top-0 z-10 py-4" style={{ background: 'var(--bg-primary)' }}>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm" style={{ color: '#9ca3af' }}>
          <ArrowLeft className="w-4 h-4" />
          Cancel
        </button>
        <h1 className="font-display font-bold text-lg text-white">Edit Profile</h1>
        <button
          onClick={() => saveMutation.mutate(form)}
          disabled={!isDirty || saveMutation.isPending}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-semibold disabled:opacity-40 transition-all"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: 'white' }}
        >
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
      </div>

      <div className="space-y-8">
        {/* ── Photos ──────────────────────────────────────── */}
        <Section title="Photos" sub="Add up to 9 photos. First photo is your main profile picture.">
          <div className="grid grid-cols-3 gap-3">
            {[...Array(9)].map((_, i) => {
              const photo = ((form.photos as string[]) || [])[i];
              const isUploading = uploadingSlot === i;
              return (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-2xl overflow-hidden relative group cursor-pointer animate-fade-in"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.1)' }}
                  onClick={() => !photo && !isUploading && handleSlotClick(i)}
                >
                  {isUploading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-[#8b5cf6]" />
                      <span className="text-[10px] font-medium" style={{ color: '#9ca3af' }}>Uploading...</span>
                    </div>
                  ) : photo ? (
                    <>
                      <Image src={photo} alt={`Photo ${i + 1}`} fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePhoto(i);
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500/80 hover:bg-red-600 transition-all hover:scale-110"
                          title="Delete photo"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                        {i > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetMainPhoto(i);
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-all hover:scale-110"
                            title="Set as main photo"
                          >
                            <Camera className="w-4 h-4 text-white" />
                          </button>
                        )}
                      </div>
                      {i === 0 && (
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-md" style={{ background: '#7c3aed' }}>
                          Main
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-all" style={{ color: '#4b5563' }}>
                      <Plus className="w-6 h-6" />
                      <span className="text-[10px] font-medium">Add Photo</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        {/* ── Rich Media ──────────────────────────────────── */}
        <Section title="Rich Media" sub="Express yourself with voice and video">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Video Intro (URL)" sub="TikTok/YouTube short link">
              <input 
                className="input-field" 
                placeholder="https://..." 
                value={form.introVideoUrl as string || ''} 
                onChange={e => update('introVideoUrl', e.target.value)} 
              />
            </Field>
            <Field label="Voice Prompt (URL)" sub="Audio link or Soundcloud">
              <input 
                className="input-field" 
                placeholder="https://..." 
                value={form.voiceIntroUrl as string || ''} 
                onChange={e => update('voiceIntroUrl', e.target.value)} 
              />
            </Field>
          </div>
        </Section>

        {/* ── Basic Info ──────────────────────────────────── */}
        <Section title="Basic Info">
          <Field label="Full Name">
            <input className="input-field" value={form.fullName as string || ''} onChange={e => update('fullName', e.target.value)} />
          </Field>
          <Field label="Bio" sub={`${((form.bio as string) || '').length}/500`}>
            <textarea
              className="input-field resize-none"
              rows={4}
              value={form.bio as string || ''}
              onChange={e => update('bio', e.target.value.slice(0, 500))}
              placeholder="Tell your story..."
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="City">
              <input className="input-field" value={form.city as string || ''} onChange={e => update('city', e.target.value)} />
            </Field>
            <Field label="Country">
              <input className="input-field" value={form.country as string || ''} onChange={e => update('country', e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Career">
              <input className="input-field" value={form.career as string || ''} onChange={e => update('career', e.target.value)} placeholder="Your profession" />
            </Field>
            <Field label="Height (cm)">
              <input className="input-field" type="number" value={form.height as string || ''} onChange={e => update('height', e.target.value)} min={140} max={220} />
            </Field>
          </div>
        </Section>

        {/* ── Identity ────────────────────────────────────── */}
        <Section title="Identity">
          <Field label="Languages Spoken">
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(lang => (
                <ChipButton key={lang} label={lang} active={(form.languages as string[])?.includes(lang)} onClick={() => toggleArrayItem('languages', lang, 8)} />
              ))}
            </div>
          </Field>
        </Section>

        {/* ── Interests ───────────────────────────────────── */}
        <Section title="Interests" sub={`${((form.interests as string[]) || []).length}/10 selected`}>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(interest => (
              <ChipButton key={interest} label={interest} active={(form.interests as string[])?.includes(interest)} onClick={() => toggleArrayItem('interests', interest, 10)} />
            ))}
          </div>
        </Section>

        {/* ── Personality ──────────────────────────────────── */}
        <Section title="Personality" sub="Select traits that describe you">
          <div className="flex flex-wrap gap-2">
            {PERSONALITY_TRAITS.map(trait => (
              <ChipButton key={trait} label={trait} active={(form.personalityTraits as string[])?.includes(trait)} onClick={() => toggleArrayItem('personalityTraits', trait, 6)} />
            ))}
          </div>
        </Section>

        {/* ── Lifestyle ────────────────────────────────────── */}
        <Section title="Lifestyle" sub="What describes your daily life?">
          <div className="flex flex-wrap gap-2">
            {LIFESTYLE_PREFS.map(pref => (
              <ChipButton key={pref} label={pref} active={(form.lifestylePrefs as string[])?.includes(pref)} onClick={() => toggleArrayItem('lifestylePrefs', pref, 6)} />
            ))}
          </div>
        </Section>
      </div>

      {/* Hidden file input for uploading photos */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}

// ── Helper Components ──────────────────────────────────────────

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg text-white">{title}</h2>
        {sub && <span className="text-xs" style={{ color: '#6b7280' }}>{sub}</span>}
      </div>
      <div className="space-y-4">{children}</div>
    </motion.div>
  );
}

function Field({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex justify-between text-sm font-medium mb-1.5" style={{ color: '#9ca3af' }}>
        {label}
        {sub && <span style={{ color: '#6b7280' }}>{sub}</span>}
      </label>
      {children}
    </div>
  );
}

function ChipButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
      style={{
        background: active ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${active ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
        color: active ? '#a78bfa' : '#9ca3af',
      }}
    >
      {active && '✓ '}{label}
    </button>
  );
}
