import React from 'react';
import { useNavigate } from 'react-router-dom';

function BlogCard({ title, excerpt, date, readTime, slug, image }) {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/blog/${slug}`)}
      className="glass-strong rounded-2xl overflow-hidden hover:scale-105 transition-all cursor-pointer group"
    >
      {image && (
        <div className="h-48 overflow-hidden bg-gray-800">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
          <span>{date}</span>
          <span>•</span>
          <span>{readTime} min read</span>
        </div>
        
        <h2 className="text-2xl font-bold mb-3 group-hover:text-yellow-400 transition-colors">
          {title}
        </h2>
        
        <p className="text-gray-400 mb-4 line-clamp-3">
          {excerpt}
        </p>
        
        <div className="flex items-center gap-2 text-yellow-400 font-semibold">
          Read More 
          <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default BlogCard;
