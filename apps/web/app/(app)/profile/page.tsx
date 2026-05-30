'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef } from 'react';
import {
  Settings, Camera, CheckCircle, Edit3, MapPin, Briefcase, GraduationCap,
  Heart, Users, Eye, Star, Crown, Sparkles, Loader2, XCircle
} from 'lucide-react';
import { api } from '@/lib/api/client';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user: clerkUser } = useUser();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => api.get('/api/users/me').then(r => r.data),
  });

  const profile = data?.user;

  const handleVerifyClick = () => {
    fileInputRef.current?.click();
  };

  const handleSelfieChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    e.target.value = '';

    const formData = new FormData();
    formData.append('photo', file);

    setIsVerifying(true);
    const toastId = toast.loading('Uploading verification selfie...');

    try {
      // 1. Upload photo to backend
      const uploadRes = await api.post('/api/upload/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const selfieUrl = uploadRes.data.url;

      // 2. Submit verification request
      toast.loading('Submitting verification request...', { id: toastId });
      await api.post('/api/users/verify-request', { selfieUrl });

      toast.success('Selfie submitted! Verification is pending. 🚀', { id: toastId });
      
      // Invalidate query to refresh profile status
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Verification request failed. Please try again.', { id: toastId });
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-3xl shimmer" style={{ background: 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>
    );
  }

  const age = profile.dateOfBirth
    ? Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-black text-white">My Profile</h1>
        <Link
          href="/settings"
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-4xl overflow-hidden mb-6 relative"
        style={{ background: 'rgba(22,22,48,0.8)', border: '1px solid rgba(139,92,246,0.2)' }}
      >
        {/* Cover/Photo */}
        <div className="relative h-48 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a0a2e, #0d1b4b)' }}>
          {profile.photos?.[0] && (
            <Image src={profile.photos[0]} alt="Cover" fill className="object-cover opacity-40" />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div
                className="w-24 h-24 rounded-3xl overflow-hidden"
                style={{ outline: '4px solid #7c3aed', outlineOffset: '-2px' }}
              >
                {profile.profilePhoto ? (
                  <Image src={profile.profilePhoto} alt={profile.fullName} fill className="object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-4xl"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
                  >
                    {profile.fullName?.charAt(0)}
                  </div>
                )}
              </div>
              <Link
                href="/profile/edit"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center hover:scale-115 transition-all shadow-md"
                style={{ background: '#7c3aed' }}
              >
                <Camera className="w-4 h-4 text-white" />
              </Link>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display font-black text-xl text-white">
                  {profile.fullName}{age ? `, ${age}` : ''}
                </h2>
                {profile.isVerified && (
                  <CheckCircle className="w-5 h-5" style={{ color: '#818cf8' }} />
                )}
              </div>
              {profile.city && (
                <div className="flex items-center gap-1 text-sm" style={{ color: '#9ca3af' }}>
                  <MapPin className="w-3.5 h-3.5" />
                  {profile.city}{profile.country ? `, ${profile.country}` : ''}
                </div>
              )}
            </div>

            {/* Subscription badge */}
            {profile.subscriptionTier !== 'FREE' && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold"
                style={{
                  background: profile.subscriptionTier === 'GOLD'
                    ? 'rgba(251,191,36,0.2)' : 'rgba(139,92,246,0.2)',
                  color: profile.subscriptionTier === 'GOLD' ? '#fbbf24' : '#a78bfa',
                }}
              >
                <Crown className="w-3.5 h-3.5" />
                {profile.subscriptionTier}
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { icon: Heart, label: 'Matches', value: profile.matchCount || 0 },
              { icon: Eye, label: 'Visitors', value: profile._count?.profileVisits || 0 },
              { icon: Star, label: 'Likes', value: profile.likesReceived || 0 },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: '#8b5cf6' }} />
                  <div className="font-bold text-white text-lg">{stat.value}</div>
                  <div className="text-xs" style={{ color: '#6b7280' }}>{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Profile completion */}
          <div className="mb-4">
            <div className="flex justify-between mb-1.5">
              <span className="text-xs font-medium" style={{ color: '#9ca3af' }}>Profile Strength</span>
              <span className="text-xs font-bold" style={{ color: '#a78bfa' }}>{profile.profileCompletion}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profile.profileCompletion}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #7c3aed, #2563eb)' }}
              />
            </div>
          </div>

          {profile.bio && (
            <p className="text-sm leading-relaxed" style={{ color: '#9ca3af' }}>{profile.bio}</p>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link href="/profile/edit" className="btn-secondary py-3 text-sm justify-center">
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </Link>
        <Link href="/premium" className="btn-gold py-3 text-sm justify-center">
          <Sparkles className="w-4 h-4" />
          Go Premium
        </Link>
      </div>

      {/* Details */}
      {profile.interests?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-5 mb-4"
        >
          <h3 className="font-semibold text-white mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest: string) => (
              <span
                key={interest}
                className="px-3 py-1.5 rounded-2xl text-xs font-medium"
                style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}
              >
                {interest}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Verification CTA */}
      {!profile.isVerified && profile.verificationStatus === 'UNVERIFIED' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-5"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 flex-shrink-0" style={{ color: '#22c55e' }} />
              <div>
                <h3 className="font-semibold text-white mb-0.5">Get Verified</h3>
                <p className="text-xs" style={{ color: '#9ca3af' }}>
                  Verified profiles get 3x more matches. Takes under 2 minutes.
                </p>
              </div>
            </div>
            <button
              onClick={handleVerifyClick}
              disabled={isVerifying}
              className="flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-bold text-black hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: '#22c55e' }}
            >
              Verify
            </button>
          </div>
        </motion.div>
      )}

      {!profile.isVerified && profile.verificationStatus === 'PENDING' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-5"
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}
        >
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#fbbf24] flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-white mb-0.5">Verification Pending</h3>
              <p className="text-xs" style={{ color: '#9ca3af' }}>
                Our safety team is currently reviewing your selfie. Typically takes under 24 hours.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {!profile.isVerified && profile.verificationStatus === 'REJECTED' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-5"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 flex-shrink-0 text-red-500" />
              <div>
                <h3 className="font-semibold text-white mb-0.5">Verification Rejected</h3>
                <p className="text-xs" style={{ color: '#9ca3af' }}>
                  Your previous photo was rejected. Please upload a clear selfie to try again.
                </p>
              </div>
            </div>
            <button
              onClick={handleVerifyClick}
              disabled={isVerifying}
              className="flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      )}

      {/* Hidden file input for verification selfie upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleSelfieChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
