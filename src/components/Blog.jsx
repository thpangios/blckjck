import React from 'react';
import BlogCard from './BlogCard';
import { Helmet } from 'react-helmet';

function Blog() {
  // This will be your list of blog posts
  // Later we can make this dynamic
  const posts = [
    {
      slug: 'how-to-count-cards-in-blackjack',
      title: 'How to Count Cards in Blackjack: Complete Beginner\'s Guide',
      excerpt: 'Learn card counting step-by-step with the Hi-Lo system. Complete beginner\'s guide with examples, practice drills, and free training tools. Legal and proven method.',
      date: 'January 18, 2025',
      readTime: 12,
      image: '/images/blog/card-counting.jpg' // You can add images later
    }
    // Add more posts here as you create them
  ];

  return (
    <>
      <Helmet>
        <title>Casino Strategy Blog - Ace Edge</title>
        <meta name="description" content="Learn blackjack strategy, card counting, video poker, and casino game tactics. Free guides and tutorials from professional advantage players." />
      </Helmet>

      <div className="min-h-screen bg-[#0A0A0A] text-white">
        {/* Header */}
        <div className="pt-32 pb-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Casino Strategy <span className="text-yellow-400">Blog</span>
            </h1>
            <p className="text-xl text-gray-400">
              Master casino games with expert guides, strategy tutorials, and advantage play techniques.
            </p>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogCard key={post.slug} {...post} />
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center text-gray-400 py-20">
              <p className="text-xl">No posts yet. Check back soon!</p>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center pb-20">
          <a 
            href="/"
            className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to App
          </a>
        </div>
      </div>
    </>
  );
}

export default Blog;
