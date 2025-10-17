import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import BlogCard from './BlogCard';

function Blog() {
  const navigate = useNavigate();

  // Your blog posts list
const posts = [
  {
    slug: 'how-to-count-cards-in-blackjack',
    title: "How to Count Cards in Blackjack: Complete Beginner's Guide",
    excerpt: 'Learn card counting step-by-step with the Hi-Lo system. Complete beginner\'s guide with examples, practice drills, and free training tools. Legal and proven method.',
    date: 'January 18, 2025',
    readTime: 12,
    image: '/images/ai-coach.png'
  },
  {
    slug: 'blackjack-basic-strategy-chart',
    title: 'Blackjack Basic Strategy Chart - Free Printable PDF & Complete Guide',
    excerpt: 'Master blackjack with our free printable basic strategy chart. Reduce house edge to 0.5% with perfect play. Includes hard hands, soft hands, and pair splitting.',
    date: 'January 19, 2025',
    readTime: 10,
    image: '/images/cin-image.png'
  }
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
            <p className="text-xl text-gray-400 mb-8">
              Master casino games with expert guides, strategy tutorials, and advantage play techniques.
            </p>
            
            {/* Back to App Button */}
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to App
            </button>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="max-w-7xl mx-auto px-6 pb-20">
          {posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <BlogCard key={post.slug} {...post} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-20">
              <p className="text-xl">First article coming soon! 🚀</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Blog;
