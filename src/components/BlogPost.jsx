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

  useEffect(() => {
    // Load the markdown file
    import(`../posts/${slug}.md`)
      .then(res => fetch(res.default))
      .then(res => res.text())
      .then(text => {
        // Extract metadata from markdown
        const metaRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = text.match(metaRegex);
        
        if (match) {
          const metaText = match[1];
          const contentText = match[2];
          
          // Parse metadata
          const meta = {};
          metaText.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length) {
              meta[key.trim()] = valueParts.join(':').trim();
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
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{metadata.title || 'Blog Post'} - Ace Edge</title>
        <meta name="description" content={metadata.description || ''} />
        <meta name="keywords" content={metadata.keywords || ''} />
      </Helmet>

      <div className="min-h-screen bg-[#0A0A0A] text-white">
        {/* Article Header */}
        <article className="max-w-4xl mx-auto px-6 pt-32 pb-20">
          {/* Back Button */}
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors mb-8"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blog
          </button>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {metadata.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-gray-400 mb-8 pb-8 border-b border-gray-800">
            <span>{metadata.date}</span>
            <span>•</span>
            <span>{metadata.readTime} min read</span>
          </div>

          {/* Article Content */}
          <div className="prose prose-invert prose-lg max-w-none
            prose-headings:text-white prose-headings:font-bold
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
            prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
            prose-a:text-yellow-400 prose-a:no-underline hover:prose-a:text-yellow-300
            prose-strong:text-white prose-strong:font-bold
            prose-ul:text-gray-300 prose-ul:my-6
            prose-ol:text-gray-300 prose-ol:my-6
            prose-li:my-2
            prose-code:text-yellow-400 prose-code:bg-gray-900 prose-code:px-2 prose-code:py-1 prose-code:rounded
            prose-blockquote:border-l-4 prose-blockquote:border-yellow-400 prose-blockquote:pl-6 prose-blockquote:italic
            prose-img:rounded-xl prose-img:shadow-2xl
          ">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>

          {/* CTA at the end */}
          <div className="mt-16 p-8 glass-strong rounded-2xl text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Practice?</h3>
            <p className="text-gray-400 mb-6">
              Put these strategies into action with Ace Edge's AI-powered training platform.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-8 py-4 rounded-xl font-bold text-lg hover:from-yellow-600 hover:to-yellow-700 transition-all"
            >
              Start Training Free
            </button>
          </div>
        </article>
      </div>
    </>
  );
}

export default BlogPost;
