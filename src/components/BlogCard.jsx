import React from 'react';
import { useNavigate } from 'react-router-dom';

function BlogCard({ title, excerpt, date, readTime, slug, image }) {
  const navigate = useNavigate();

  return (
    <article
      onClick={() => navigate(`/blog/${slug}`)}
      className="glass-strong rounded-2xl overflow-hidden cursor-pointer group card-lift relative"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.08) 100%)',
        transition: 'all 0.35s cubic-bezier(0.4, 0.0, 0.2, 1)',
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Image Section */}
      {image && (
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => e.target.style.display = 'none'}
          />
          {/* Image overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Read time badge */}
          <div className="absolute top-4 right-4">
            <div className="glass-dark-strong px-3 py-1.5 rounded-full text-xs font-semibold text-white backdrop-blur-md flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {readTime} min
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="p-6 md:p-8">
        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <time className="font-medium">{date}</time>
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight group-hover:text-yellow-400 transition-colors line-clamp-2">
          {title}
        </h2>

        {/* Excerpt */}
        <p className="text-gray-400 mb-6 leading-relaxed line-clamp-3">
          {excerpt}
        </p>

        {/* Read More Button */}
        <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm uppercase tracking-wide group-hover:gap-4 transition-all">
          <span>Read Full Article</span>
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
           style={{ boxShadow: '0 0 30px rgba(244, 196, 48, 0.15)' }} />
    </article>
  );
}

export default BlogCard;
