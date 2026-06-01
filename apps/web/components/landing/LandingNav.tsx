"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Menu, X } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";

export default function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Discover", href: "#discover" },
    { name: "Features", href: "#features" },
    { name: "Safety", href: "#safety" },
    { name: "Success Stories", href: "#stories" },
    { name: "Pricing", href: "#pricing" },
  ];

  const handlePricingClick = async (e: React.MouseEvent, href: string) => {
    if (href === "#pricing") {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        e.preventDefault();
        toast.error("Please sign in or sign up to view and buy pricing plans!");
        router.push("/sign-in");
        return;
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#131A2B]/80 backdrop-blur-md border-b border-white/10 shadow-lg py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] p-2 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform shadow-lg shadow-[#7C3AED]/20">
            <Heart className="w-5 h-5 text-white fill-current" />
          </div>
          <span className="text-xl font-bold tracking-wider text-white">
            VOLVERO
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  onClick={(e) => handlePricingClick(e, link.href)}
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-white hover:text-gray-300 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/sign-up"
              className="text-sm font-medium text-white bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-[#7C3AED]/30 transition-all transform hover:-translate-y-0.5"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white hover:text-gray-300 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#131A2B]/95 backdrop-blur-xl border-b border-white/10 py-4 px-4 shadow-xl">
          <ul className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="block text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    handlePricingClick(e, link.href);
                  }}
                >
                  {link.name}
                </Link>
              </li>
            ))}
            <li className="pt-4 border-t border-white/10 flex flex-col gap-3">
              <Link
                href="/sign-in"
                className="w-full text-center py-2.5 text-sm font-medium text-white rounded-full border border-white/20 hover:bg-white/5 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/sign-up"
                className="w-full text-center py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#7C3AED] to-[#EC4899] rounded-full shadow-lg shadow-[#7C3AED]/20"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
