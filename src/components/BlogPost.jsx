import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Helmet } from 'react-helmet';

function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    
    fetch(`/posts/${slug}.md`)
      .then(res => {
        if (!res.ok) throw new Error('Post not found');
        return res.text();
      })
      .then(text => {
        const metaRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = text.match(metaRegex);
        
        if (match) {
          const metaText = match[1];
          const contentText = match[2];
          
          const meta = {};
          metaText.split('\n').forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex !== -1) {
              const key = line.substring(0, colonIndex).trim();
              const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
              meta[key] = value;
            }
          });
          
          setMetadata(meta);
          setContent(contentText);
        } else {
          setContent(text);
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading blog post:', err);
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-xl text-gray-400">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-gray-400 mb-8">
            This article doesn't exist or may have been moved.
          </p>
          <button
            onClick={() => navigate('/blog')}
            className="bg-yellow-500 text-black px-8 py-3 rounded-xl font-bold hover:bg-yellow-600 transition-all"
          >
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{metadata.title || 'Blog Post'} - Ace Edge</title>
        <meta name="description" content={metadata.description || 'Casino strategy and gaming guides from Ace Edge'} />
        {metadata.keywords && <meta name="keywords" content={metadata.keywords} />}
        <meta property="og:title" content={metadata.title || 'Blog Post'} />
        <meta property="og:description" content={metadata.description || ''} />
        <meta property="og:type" content="article" />
        {metadata.date && <meta property="article:published_time" content={metadata.date} />}
      </Helmet>

      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <article className="max-w-4xl mx-auto px-6 pt-24 md:pt-32 pb-20">
          {/* Back Button */}
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors mb-8 group"
          >
            <svg 
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blog
          </button>

          {/* Article Header */}
          <header className="mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {metadata.title || 'Untitled Post'}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-400 pb-8 border-b border-gray-800">
              {metadata.date && <span>{metadata.date}</span>}
              {metadata.date && metadata.readTime && <span>•</span>}
              {metadata.readTime && <span>{metadata.readTime} min read</span>}
              {metadata.author && (
                <>
                  <span>•</span>
                  <span>By {metadata.author}</span>
                </>
              )}
            </div>
          </header>

          {/* Article Content */}
 <div className="prose prose-invert prose-lg max-w-none
  prose-headings:text-white prose-headings:font-bold prose-headings:scroll-mt-24
  prose-h1:text-4xl prose-h1:mb-6
  prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-yellow-400
  prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
  prose-h4:text-xl prose-h4:mt-6 prose-h4:mb-3
  prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
  prose-a:text-yellow-400 prose-a:no-underline prose-a:font-semibold hover:prose-a:text-yellow-300 hover:prose-a:underline
  prose-strong:text-white prose-strong:font-bold
  prose-em:text-gray-300 prose-em:italic
  prose-ul:text-gray-300 prose-ul:my-6 prose-ul:list-disc
  prose-ol:text-gray-300 prose-ol:my-6 prose-ol:list-decimal
  prose-li:my-2 prose-li:leading-relaxed
  prose-code:text-yellow-400 prose-code:bg-gray-900 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
  prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800 prose-pre:rounded-xl prose-pre:p-4
  prose-blockquote:border-l-4 prose-blockquote:border-yellow-400 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-400
  prose-img:rounded-xl prose-img:shadow-2xl prose-img:my-8 prose-img:w-full
  prose-hr:border-gray-800 prose-hr:my-12
  [&_table]:border-collapse [&_table]:w-full [&_table]:my-8 [&_table]:text-sm [&_table]:shadow-xl [&_table]:rounded-lg [&_table]:overflow-hidden
  [&_thead]:bg-gradient-to-r [&_thead]:from-yellow-600 [&_thead]:to-yellow-500
  [&_th]:border [&_th]:border-gray-700 [&_th]:p-3 [&_th]:text-left [&_th]:font-bold [&_th]:text-black [&_th]:uppercase [&_th]:text-xs [&_th]:tracking-wide
  [&_td]:border [&_td]:border-gray-700 [&_td]:p-3 [&_td]:text-gray-300 [&_td]:bg-gray-800/50
  [&_tbody_tr]:hover:bg-gray-700/30 [&_tbody_tr]:transition-colors
  [&_tbody_tr:nth-child(even)]:bg-gray-800/30
">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>

          {/* CTA Section */}
          <div className="mt-16 p-8 glass-strong rounded-2xl text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Practice?
            </h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Put these strategies into action with Ace Edge's AI-powered training platform. 
              Master card counting, optimal play, and casino games risk-free.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-8 py-4 rounded-xl font-bold text-lg hover:from-yellow-600 hover:to-yellow-700 transition-all hover:scale-105 shadow-xl"
            >
              Start Training Free
            </button>
          </div>

          {/* Share Section */}
          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400 mb-4">Found this helpful? Share it!</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  const url = window.location.href;
                  const text = metadata.title;
                  window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="text-gray-400 hover:text-yellow-400 transition-colors"
                aria-label="Share on Twitter"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                </svg>
              </button>
              <button
                onClick={() => {
                  const url = window.location.href;
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                }}
                className="text-gray-400 hover:text-yellow-400 transition-colors"
                aria-label="Share on Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
                </svg>
              </button>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}

export default BlogPost;
