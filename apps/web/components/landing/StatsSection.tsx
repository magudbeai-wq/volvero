export default function StatsSection() {
  const stats = [
    { value: "5M+", label: "Members" },
    { value: "190+", label: "Countries" },
    { value: "50M+", label: "Matches" },
    { value: "99.9%", label: "Uptime" },
  ];

  return (
    <section className="py-24 bg-[#0B1020] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[400px] bg-[#7C3AED]/10 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-[#131A2B]/60 backdrop-blur-md border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center transform hover:-translate-y-1 transition-all duration-300 hover:border-white/10 hover:shadow-xl hover:shadow-[#7C3AED]/5 group"
            >
              <h3 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#7C3AED] to-[#EC4899] mb-2 drop-shadow-sm group-hover:scale-105 transition-transform duration-300">
                {stat.value}
              </h3>
              <p className="text-gray-400 font-medium tracking-wide uppercase text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
