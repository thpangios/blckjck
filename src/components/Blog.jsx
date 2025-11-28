import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import BlogCard from './BlogCard';

function Blog() {
  const navigate = useNavigate();

 const posts = [
  {
    slug: 'mit-blackjack-team-secrets',
    title: 'MIT Blackjack Team Secrets: How Students Beat Casinos for $50 Million',
    excerpt: 'The true story of how MIT students used card counting, team play, and mathematical precision to win millions from Vegas casinos. Learn their exact strategy, bankroll management, and why they eventually stopped.',
    date: 'January 22, 2025',
    readTime: 15,
    image: '/images/ai-coach.png'
  },
  {
    slug: 'how-to-count-cards-in-blackjack',
    title: 'How to Count Cards in Blackjack: Complete Beginner\'s Guide',
    excerpt: 'Learn card counting step-by-step with the Hi-Lo system. Complete beginner\'s guide with examples, practice drills, and free training tools. Legal and proven method.',
    date: 'January 18, 2025',
    readTime: 12,
    image: '/images/cin-image.png'
  },
  {
    slug: 'blackjack-basic-strategy-chart',
    title: 'Blackjack Basic Strategy Chart - Free Printable PDF & Complete Guide',
    excerpt: 'Master blackjack with our free printable basic strategy chart. Reduce house edge to 0.5% with perfect play. Includes hard hands, soft hands, and pair splitting.',
    date: 'January 19, 2025',
    readTime: 10,
    image: '/images/cin-img.png'
  },
  {
    slug: 'is-card-counting-illegal',
    title: 'Is Card Counting Illegal? The Truth About Casino Advantage Play',
    excerpt: 'Card counting is 100% legal but casinos can ban you. Learn the laws, your rights, casino countermeasures, famous cases, and how to practice legally.',
    date: 'January 20, 2025',
    readTime: 8,
    image: '/images/ai-coach.png'
  },
  {
    slug: 'how-to-read-baccarat-roadmap',
    title: 'How to Read a Baccarat Roadmap: Complete Guide to Pattern Recognition',
    excerpt: 'Master baccarat roadmaps with our complete guide. Learn to read all 5 roadmap types: Big Road, Big Eye Boy, Small Road, Cockroach Road, and Bead Plate.',
    date: 'January 21, 2025',
    readTime: 11,
    image: '/images/cin-img.png'
  }
];

  return (
    <>
      <Helmet>
        <title>Casino Strategy Blog - Ace Edge</title>
        <meta name="description" content="Learn blackjack strategy, card counting, video poker, and casino game tactics. Free guides and tutorials from professional advantage players." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-20 left-10 text-9xl animate-float">♠</div>
          <div className="absolute top-40 right-20 text-9xl text-yellow-400 animate-float" style={{ animationDelay: '1s' }}>♣</div>
          <div className="absolute bottom-40 left-40 text-9xl text-yellow-400 animate-float" style={{ animationDelay: '2s' }}>♥</div>
        </div>

        {/* Header */}
        <div className="relative pt-32 pb-20 px-6">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-block mb-6 px-4 py-2 glass rounded-full text-yellow-400 font-semibold text-sm animate-fade-in-up">
              📚 Strategy Guides & Expert Insights
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Casino Strategy <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">Blog</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Master blackjack, card counting, and advantage play with in-depth guides from professional players.
            </p>

            {/* Back to App Button */}
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-all group animate-fade-in-up glass px-6 py-3 rounded-xl hover:scale-105"
              style={{ animationDelay: '0.3s' }}
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to App
            </button>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="relative max-w-7xl mx-auto px-6 pb-24">
          {posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <div
                  key={post.slug}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <BlogCard {...post} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-20">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-2xl font-bold mb-2">Articles Coming Soon</p>
              <p className="text-lg">Check back for expert casino strategy guides!</p>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="relative max-w-5xl mx-auto px-6 pb-24">
          <div className="glass-strong rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 via-transparent to-yellow-600/10" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Put Theory into Practice?
              </h2>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Train with Ace Edge's AI-powered platform. Master card counting, optimal strategy, and more with real-time guidance.
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-10 py-4 rounded-xl font-bold text-lg hover:from-yellow-600 hover:to-yellow-700 transition-all hover:scale-105 shadow-2xl"
              >
                Start Training Free
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Blog;
