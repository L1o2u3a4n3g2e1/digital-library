import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FF] via-[#EDE9FE] to-[#EDE9FE] flex items-center justify-center p-4">
      {/* Decorative circles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#DDD6FE]/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#8B5CF6]/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-[#EDE9FE]/30 blur-2xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-lg">ML</span>
            </div>
            <span className="font-['Playfair_Display'] font-semibold text-[#2E1065] text-xl">Multilingual Library</span>
          </Link>
          {title && <h2 className="mt-4 text-2xl font-['Playfair_Display'] font-semibold text-[#2E1065]">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-[#6B7280]">{subtitle}</p>}
        </div>
        <div className="glass rounded-3xl shadow-[0_20px_60px_-10px_rgba(124,58,237,0.2)] p-8">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
