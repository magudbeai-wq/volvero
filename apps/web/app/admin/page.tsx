'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users, Heart, MessageCircle, DollarSign, Flag, TrendingUp, Shield, Zap,
  BarChart3, Settings, LogOut, Activity
} from 'lucide-react';
import { api } from '@/lib/api/client';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalMatches: number;
  totalMessages: number;
  pendingReports: number;
  newUsersToday: number;
  newUsersWeek: number;
  estimatedMRR: number;
  conversionRate: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <TrendingUp className="w-4 h-4" style={{ color: '#22c55e' }} />
      </div>
      <div className="font-display text-3xl font-black text-white mb-1">{value}</div>
      <div className="text-sm font-medium" style={{ color: '#9ca3af' }}>{label}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{sub}</div>}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.get('/api/admin/dashboard', {
      headers: { 'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '' }
    }).then(r => r.data),
    refetchInterval: 30000,
  });

  const stats: DashboardStats = data?.stats || {
    totalUsers: 0, activeUsers: 0, premiumUsers: 0, totalMatches: 0,
    totalMessages: 0, pendingReports: 0, newUsersToday: 0,
    newUsersWeek: 0, estimatedMRR: 0, conversionRate: '0',
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: '#030311' }}
    >
      {/* Admin Top Nav */}
      <div
        className="flex items-center justify-between px-8 py-4 sticky top-0 z-10"
        style={{ background: 'rgba(10,10,31,0.95)', borderBottom: '1px solid rgba(139,92,246,0.15)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
          >
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-display font-black text-white text-sm">LAMAANE DOORE</div>
            <div className="text-xs" style={{ color: '#6b7280' }}>Admin Dashboard</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
            <Activity className="w-3 h-3" />
            Live
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-black text-white mb-1">Platform Overview</h1>
          <p style={{ color: '#6b7280' }}>Real-time platform metrics and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
          <StatCard icon={Users} label="Total Users" value={stats.totalUsers.toLocaleString()} sub={`+${stats.newUsersToday} today`} color="#8b5cf6" delay={0} />
          <StatCard icon={Activity} label="Online Now" value={stats.activeUsers.toLocaleString()} sub="Active users" color="#22c55e" delay={0.05} />
          <StatCard icon={Heart} label="Total Matches" value={stats.totalMatches.toLocaleString()} color="#ec4899" delay={0.1} />
          <StatCard icon={MessageCircle} label="Messages Sent" value={stats.totalMessages.toLocaleString()} color="#3b82f6" delay={0.15} />
          <StatCard
            icon={DollarSign}
            label="Est. MRR"
            value={`$${(stats.estimatedMRR / 100).toLocaleString()}`}
            sub={`${stats.conversionRate}% conversion`}
            color="#fbbf24"
            delay={0.2}
          />
          <StatCard icon={Zap} label="Premium Users" value={stats.premiumUsers.toLocaleString()} color="#a78bfa" delay={0.25} />
          <StatCard icon={Flag} label="Pending Reports" value={stats.pendingReports} color="#ef4444" delay={0.3} />
          <StatCard icon={TrendingUp} label="New This Week" value={stats.newUsersWeek.toLocaleString()} color="#06b6d4" delay={0.35} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Manage Users', href: '/admin/users', icon: Users, color: '#8b5cf6', desc: 'View, ban, verify users' },
            { label: 'Moderation Queue', href: '/admin/reports', icon: Flag, color: '#ef4444', desc: `${stats.pendingReports} pending reports` },
            { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, color: '#22c55e', desc: '30-day growth charts' },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.a
                key={action.label}
                href={action.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="card-hover p-5 cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${action.color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: action.color }} />
                  </div>
                  <h3 className="font-semibold text-white">{action.label}</h3>
                </div>
                <p className="text-sm" style={{ color: '#6b7280' }}>{action.desc}</p>
              </motion.a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
