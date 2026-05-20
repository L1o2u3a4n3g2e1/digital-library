import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { getCategoryLabel } from '../../utils/constants';

export default function CategoryCard({ category, bookCount, language }) {
  const isRw = language === 'rw';
  const label = getCategoryLabel(category.id, language);

  return (
    <Link to={`/search?category=${category.id}`}>
      <motion.div
        whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(124,58,237,0.12)' }}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-brand-50 p-6 shadow-soft transition-all border border-brand-100 h-full cursor-pointer"
      >
        <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
          <div className="text-8xl">{category.icon}</div>
        </div>

        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-4xl">{category.icon}</span>
            <FiArrowRight className="text-brand-300 group-hover:text-brand-600 transition-colors" size={20} />
          </div>

          <h3 className="text-xl font-bold text-brand-950 group-hover:text-brand-600 transition-colors">{label}</h3>

          <div className="mt-4 flex items-center gap-2">
            <div className="h-1 flex-grow rounded-full bg-gradient-to-r from-brand-300 to-brand-100 group-hover:to-brand-300 transition-colors" />
          </div>

          <p className="mt-4 text-sm text-gray-600 group-hover:text-brand-700 transition-colors">
            {bookCount} {isRw ? bookCount === 1 ? 'igitabo' : 'ibitabo' : bookCount === 1 ? 'book' : 'books'}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
