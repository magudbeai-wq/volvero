import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog — VOLVERO Journal',
  description: 'Dating tips, success stories, and relationship advice from VOLVERO experts.',
};

const POSTS = [
  {
    id: 1,
    title: 'The Science of Attraction: What Makes a Perfect Match?',
    excerpt: 'Discover the fascinating psychology behind human connection and how our smart matching algorithm uses these principles.',
    category: 'Relationships',
    author: 'Dr. Sarah Jenkins',
    date: 'Dec 12, 2025',
    readTime: '6 min read',
    image: '/couple-1.png',
    gradient: null,
  },
  {
    id: 2,
    title: '10 First Date Ideas That Will Blow Their Mind',
    excerpt: 'Skip the boring coffee dates. Here are 10 unforgettable first date ideas guaranteed to make a lasting impression.',
    category: 'Dating Tips',
    author: 'Michael Chang',
    date: 'Dec 10, 2025',
    readTime: '4 min read',
    image: '/couple-2.png',
    gradient: null,
  },
  {
    id: 3,
    title: 'How VOLVERO Uses Smart Matching to Find Your Soulmate',
    excerpt: 'A deep dive into the technology powering our platform and how we go beyond the superficial swipe.',
    category: 'Product',
    author: 'The VOLVERO Team',
    date: 'Dec 05, 2025',
    readTime: '8 min read',
    image: null,
    gradient: 'linear-gradient(135deg, #7C3AED, #9333EA)',
  },
  {
    id: 4,
    title: 'Long Distance Love: Making It Work in 2025',
    excerpt: 'Connecting across borders has never been easier. Learn how couples are maintaining strong bonds globally.',
    category: 'Relationships',
    author: 'Elena Rodriguez',
    date: 'Nov 28, 2025',
    readTime: '5 min read',
    image: null,
    gradient: 'linear-gradient(135deg, #EC4899, #7C3AED)',
  },
  {
    id: 5,
    title: 'From Swipe to Forever: Real VOLVERO Success Stories',
    excerpt: 'Read heartwarming stories from couples who met on VOLVERO and are now building lives together.',
    category: 'Success Stories',
    author: 'David Smith',
    date: 'Nov 20, 2025',
    readTime: '7 min read',
    image: '/couple-1.png',
    gradient: null,
  },
  {
    id: 6,
    title: 'The Ultimate Profile Guide: Stand Out on VOLVERO',
    excerpt: 'Expert tips on choosing the right photos and writing a bio that attracts the kind of matches you actually want.',
    category: 'Dating Tips',
    author: 'Jessica Lee',
    date: 'Nov 15, 2025',
    readTime: '5 min read',
    image: null,
    gradient: 'linear-gradient(135deg, #FBBF24, #EC4899)',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen pt-24 pb-20" style={{ backgroundColor: '#0B1020' }}>
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="relative rounded-4xl overflow-hidden h-[400px] flex items-center justify-center border border-white/10 shadow-2xl">
          <Image 
            src="/blog-header.png" 
            alt="VOLVERO Blog Header" 
            fill
            className="object-cover opacity-60"
            sizes="(max-width: 1280px) 100vw, 1280px"
            priority
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0B1020, transparent)' }} />
          
          <div className="relative z-10 text-center max-w-3xl px-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border border-white/20 backdrop-blur-md" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Sparkles className="w-4 h-4 text-[#FBBF24]" />
              <span className="text-sm font-semibold tracking-wide text-white uppercase">The VOLVERO Journal</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black font-display text-white mb-6 drop-shadow-xl">
              Insights for Your <br className="hidden sm:block" />
              <span style={{ color: '#EC4899' }}>Dating Journey</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 drop-shadow-md">
              Dating tips, success stories, and relationship advice from our experts.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {POSTS.map((post) => (
            <Link key={post.id} href="#" className="group block h-full">
              <article 
                className="h-full flex flex-col rounded-3xl overflow-hidden backdrop-blur-xl transition-all duration-300 hover:-translate-y-2"
                style={{ 
                  background: 'rgba(19,26,43,0.6)', 
                  border: '1px solid rgba(124,58,237,0.2)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}
              >
                {/* Image/Gradient container */}
                <div className="relative h-56 w-full overflow-hidden">
                  {post.image ? (
                    <Image 
                      src={post.image} 
                      alt={post.title} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-110" 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-110" style={{ background: post.gradient! }} />
                  )}
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 text-xs font-bold text-white rounded-full shadow-lg" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h2 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-[#EC4899] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-[#94A3B8] text-sm mb-6 line-clamp-3 flex-grow">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-[#94A3B8] border-t border-white/10 pt-4 mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#7C3AED] flex items-center justify-center text-white font-bold">
                        {post.author.charAt(0)}
                      </div>
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="rounded-4xl p-8 sm:p-12 text-center relative overflow-hidden"
          style={{ 
            background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(236,72,153,0.1))',
            border: '1px solid rgba(236,72,153,0.3)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}
        >
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black font-display text-white mb-4">Never Miss an Update</h2>
            <p className="text-[#94A3B8] mb-8 max-w-xl mx-auto">
              Get the latest dating tips and VOLVERO updates delivered straight to your inbox.
            </p>
            
            <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-grow px-5 py-4 rounded-2xl text-white placeholder-gray-500 focus:outline-none"
                style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
                required
              />
              <button 
                type="submit" 
                className="px-8 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-transform hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}
              >
                Subscribe <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
