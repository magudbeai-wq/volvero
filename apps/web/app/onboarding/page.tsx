'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import {
  INTERESTS, LANGUAGES, PERSONALITY_TRAITS, LIFESTYLE_PREFS
} from '@/lib/utils';
import toast from 'react-hot-toast';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

type Gender = 'MALE' | 'FEMALE' | 'NON_BINARY' | 'PREFER_NOT_TO_SAY';
type Religion = 'ISLAM' | 'CHRISTIANITY' | 'SECULAR' | 'OTHER' | 'PREFER_NOT_TO_SAY';
type RelationshipGoal = 'MARRIAGE' | 'LONG_TERM' | 'SHORT_TERM' | 'FRIENDSHIP' | 'NOT_SURE';

interface OnboardingData {
  fullName: string;
  dateOfBirth: string;
  gender: Gender | '';
  city: string;
  country: string;
  religion: Religion | '';
  relationshipGoal: RelationshipGoal | '';
  career: string;
  bio: string;
  interests: string[];
  languages: string[];
  height: string;
}

const STEPS = [
  { id: 'basics', title: 'The Basics', emoji: '👋' },
  { id: 'identity', title: 'Your Identity', emoji: '🌍' },
  { id: 'goals', title: 'What You Want', emoji: '💜' },
  { id: 'about', title: 'About You', emoji: '✨' },
  { id: 'interests', title: 'Your Interests', emoji: '⭐' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [authUser, setAuthUser] = useState<any>(null);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    city: '',
    country: '',
    religion: '',
    relationshipGoal: '',
    career: '',
    bio: '',
    interests: [],
    languages: [],
    height: '',
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setAuthUser(user);
      }
    });
  }, [supabase]);

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.post('/api/users/onboard', payload).then(r => r.data),
    onSuccess: () => {
      toast.success('Profile created! Welcome to VOLVERO 💜');
      router.push('/discover');
    },
    onError: () => toast.error('Failed to save profile. Please try again.'),
  });

  const update = (field: keyof OnboardingData, value: unknown) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest: string) => {
    setData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest].slice(0, 10),
    }));
  };

  const toggleLanguage = (lang: string) => {
    setData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const handleSubmit = () => {
    if (!authUser) return;
    mutation.mutate({
      supabaseId: authUser.id,
      email: authUser.email,
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender || undefined,
      city: data.city,
      country: data.country,
      religion: data.religion || undefined,
      relationshipGoal: data.relationshipGoal || undefined,
      career: data.career,
      bio: data.bio,
      interests: data.interests,
      languages: data.languages,
      height: data.height ? Number(data.height) : undefined,
    });
  };

  const isLastStep = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #030311, #1a0a2e, #030311)' }}
    >
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: '#9ca3af' }}>
              Step {step + 1} of {STEPS.length}
            </span>
            <span className="text-xs" style={{ color: '#a78bfa' }}>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #7c3aed, #2563eb)' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Step Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="rounded-4xl p-8"
            style={{
              background: 'rgba(22,22,48,0.85)',
              border: '1px solid rgba(139,92,246,0.2)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Step header */}
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">{STEPS[step].emoji}</div>
              <h2 className="font-display text-2xl font-black text-white">{STEPS[step].title}</h2>
            </div>

            {/* Step content */}
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: '#9ca3af' }}>Full Name *</label>
                  <input
                    className="input-field"
                    value={data.fullName}
                    onChange={e => update('fullName', e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: '#9ca3af' }}>Date of Birth *</label>
                  <input
                    type="date"
                    className="input-field"
                    value={data.dateOfBirth}
                    onChange={e => update('dateOfBirth', e.target.value)}
                    max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: '#9ca3af' }}>Gender *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY'] as const).map(g => (
                      <button
                        key={g}
                        onClick={() => update('gender', g)}
                        className="py-3 rounded-2xl text-sm font-medium transition-all"
                        style={{
                          background: data.gender === g ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${data.gender === g ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
                          color: data.gender === g ? '#a78bfa' : '#9ca3af',
                        }}
                      >
                        {g.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: '#9ca3af' }}>Height (cm)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={data.height}
                    onChange={e => update('height', e.target.value)}
                    placeholder="e.g. 170"
                    min={140}
                    max={220}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: '#9ca3af' }}>City</label>
                  <input className="input-field" value={data.city} onChange={e => update('city', e.target.value)} placeholder="Your city" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: '#9ca3af' }}>Country</label>
                  <input className="input-field" value={data.country} onChange={e => update('country', e.target.value)} placeholder="Your country" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: '#9ca3af' }}>Religion</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['ISLAM', 'CHRISTIANITY', 'SECULAR', 'OTHER', 'PREFER_NOT_TO_SAY'] as const).map(r => (
                      <button
                        key={r}
                        onClick={() => update('religion', r)}
                        className="py-2.5 rounded-xl text-xs font-medium transition-all"
                        style={{
                          background: data.religion === r ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${data.religion === r ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
                          color: data.religion === r ? '#a78bfa' : '#9ca3af',
                        }}
                      >
                        {r.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: '#9ca3af' }}>Relationship Goal *</label>
                  <div className="space-y-2">
                    {([
                      { value: 'MARRIAGE', label: '💍 Marriage', sub: 'Looking for a life partner' },
                      { value: 'LONG_TERM', label: '💜 Long-term relationship', sub: 'Serious commitment' },
                      { value: 'FRIENDSHIP', label: '🤝 Friendship first', sub: 'See where it goes' },
                      { value: 'NOT_SURE', label: '🤔 Not sure yet', sub: "I'll know when I find them" },
                    ] as const).map(g => (
                      <button
                        key={g.value}
                        onClick={() => update('relationshipGoal', g.value)}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all"
                        style={{
                          background: data.relationshipGoal === g.value ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${data.relationshipGoal === g.value ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.06)'}`,
                        }}
                      >
                        <span className="text-xl">{g.label.split(' ')[0]}</span>
                        <div>
                          <div className="text-sm font-semibold text-white">{g.label.slice(2)}</div>
                          <div className="text-xs" style={{ color: '#6b7280' }}>{g.sub}</div>
                        </div>
                        {data.relationshipGoal === g.value && <Check className="w-4 h-4 ml-auto" style={{ color: '#a78bfa' }} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: '#9ca3af' }}>Career / Profession</label>
                  <input className="input-field" value={data.career} onChange={e => update('career', e.target.value)} placeholder="e.g. Doctor, Engineer, Teacher..." />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: '#9ca3af' }}>
                    About You <span style={{ color: '#6b7280' }}>({data.bio.length}/500)</span>
                  </label>
                  <textarea
                    className="input-field resize-none"
                    rows={5}
                    value={data.bio}
                    onChange={e => update('bio', e.target.value.slice(0, 500))}
                    placeholder="Tell potential matches about yourself, your values, and what makes you unique..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: '#9ca3af' }}>Languages Spoken</label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang}
                        onClick={() => toggleLanguage(lang)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                        style={{
                          background: data.languages.includes(lang) ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${data.languages.includes(lang) ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
                          color: data.languages.includes(lang) ? '#a78bfa' : '#9ca3af',
                        }}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <p className="text-sm mb-4" style={{ color: '#9ca3af' }}>
                  Select up to 10 interests. This helps our Smart Matching system find your best matches.
                </p>
                <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto pr-1">
                  {INTERESTS.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className="px-4 py-2 rounded-2xl text-sm font-medium transition-all"
                      style={{
                        background: data.interests.includes(interest) ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${data.interests.includes(interest) ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
                        color: data.interests.includes(interest) ? '#a78bfa' : '#9ca3af',
                      }}
                    >
                      {data.interests.includes(interest) && '✓ '}{interest}
                    </button>
                  ))}
                </div>
                <p className="text-xs mt-3" style={{ color: '#6b7280' }}>
                  {data.interests.length}/10 selected
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium disabled:opacity-30 transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {isLastStep ? (
            <button
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="btn-primary px-8 py-3 text-sm"
            >
              {mutation.isPending ? 'Creating...' : '🎉 Complete Profile'}
            </button>
          ) : (
            <button
              onClick={() => setStep(step + 1)}
              className="btn-primary px-8 py-3 text-sm"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
