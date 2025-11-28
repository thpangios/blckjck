import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

function AIAssistantGreeting() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [username, setUsername] = useState('Player');
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  // Load user profile and show greeting
  useEffect(() => {
    if (user) {
      loadUserProfile();
      // Auto-show greeting after 1 second
      setTimeout(() => {
        setShowGreeting(true);
      }, 1000);

      // Auto-hide greeting after 6 seconds
      setTimeout(() => {
        setShowGreeting(false);
      }, 7000);
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('username')
        .eq('id', user.id)
        .single();

      if (data?.username) {
        setUsername(data.username);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    const greetings = [
      `Welcome back, ${username}! 🎯 Ready to sharpen your skills?`,
      `Hey ${username}! 👋 Let's turn those cards in your favor today!`,
      `${username}, great to see you! 🔥 Which game are you conquering today?`,
      `${username} is in the house! 🎰 Time to level up your strategy!`
    ];

    if (hour < 12) {
      return `Good morning, ${username}! ☀️ Ready to start training?`;
    } else if (hour < 18) {
      return `Good afternoon, ${username}! 🌤️ Let's practice some winning strategies!`;
    } else {
      return `Good evening, ${username}! 🌙 Perfect time to master your game!`;
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { role: 'user', content: message };
    setChatMessages([...chatMessages, userMsg]);
    const userQuestion = message;
    setMessage('');

    // Add loading message
    const loadingMsg = { role: 'assistant', content: '', isLoading: true };
    setChatMessages(prev => [...prev, loadingMsg]);

    try {
      // Call n8n webhook
      const response = await fetch('https://n8n-railway-production-cc19.up.railway.app/webhook/ai-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userQuestion,
          game: 'general',
          gameState: null,
          chatHistory: chatMessages.slice(-10), // Last 10 messages for context
          timestamp: new Date().toISOString(),
          context: 'game_selector'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      // Handle different response formats from n8n
      let answerText = '';
      if (Array.isArray(data) && data.length > 0) {
        answerText = data[0].output || data[0].answer || data[0].message || '';
      } else if (data.output) {
        answerText = data.output;
      } else if (data.answer) {
        answerText = data.answer;
      } else if (data.message) {
        answerText = data.message;
      }

      // Remove loading message and add real response
      setChatMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        return [...filtered, { role: 'assistant', content: answerText || 'I received your question but had trouble generating a response. Please try again!' }];
      });

    } catch (error) {
      console.error('AI Coach error:', error);
      
      // Remove loading and show error with fallback response
      setChatMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        return [...filtered, { 
          role: 'assistant', 
          content: "I'm having trouble connecting right now. Let me give you a quick tip: " + getAIFallback(userQuestion)
        }];
      });
    }
  };

  const getAIFallback = (userMessage) => {
    const lower = userMessage.toLowerCase();
    
    if (lower.includes('blackjack')) {
      return "For Blackjack, master basic strategy first, then learn Hi-Lo card counting. The key is discipline! 🃏";
    } else if (lower.includes('baccarat')) {
      return "In Baccarat, always bet on Banker for the lowest house edge (1.06%). Avoid the Tie bet! 🎰";
    } else if (lower.includes('poker')) {
      return "Video Poker rewards perfect play. Study hand rankings and hold strategies for 99%+ RTP! 🎴";
    } else if (lower.includes('help') || lower.includes('start')) {
      return "Choose any game and I'll guide you through winning strategies! Each game has unique advantages. 💪";
    } else {
      return "I can help with game strategies, odds, and training tips. What game interests you most? 🎯";
    }
  };

  return (
    <>
      {/* Greeting Popup */}
      {showGreeting && !isOpen && (
        <div className="fixed bottom-24 right-6 z-40 animate-fade-in-up">
          <div className="glass-strong rounded-2xl p-6 max-w-sm shadow-2xl border border-rose-400/30">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                <img 
                  src="/images/ai-coach.png" 
                  alt="AI Coach" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold mb-2">
                  {getGreetingMessage()}
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  Need strategy tips or have questions? I'm here to help!
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowGreeting(false);
                      setIsOpen(true);
                    }}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-rose-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:from-yellow-600 hover:to-rose-700 transition-all"
                  >
                    Let's Chat! 💬
                  </button>
                  <button
                    onClick={() => setShowGreeting(false)}
                    className="glass px-4 py-2 rounded-lg hover:bg-gray-700 transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      {!isOpen && !showGreeting && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-gradient-to-br from-yellow-500 to-rose-600 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center group overflow-hidden"
        >
          <img 
            src="/images/ai-coach.png" 
            alt="AI Coach" 
            className="w-full h-full object-cover rounded-full"
          />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
        </button>
      )}

    {/* Chat Window */}
{isOpen && (
  <>
    {/* Backdrop for click-outside-to-close */}
    <div 
      className="fixed inset-0 z-39"
      onClick={() => setIsOpen(false)}
    />
    
    {/* Chat Window */}
    <div className="fixed bottom-6 right-6 z-40 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-3rem)] glass-strong rounded-2xl shadow-2xl flex flex-col animate-fade-in-up overflow-hidden">
          
          {/* Background Image */}
<div 
  className="absolute inset-0 opacity-20 pointer-events-none"
  style={{
    backgroundImage: 'url(/images/ai-coach.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }}
/>

        {/* Content (relative to show above background) */}
          <div className="relative z-10 flex flex-col h-full">
          
          {/* Header */}
          <div className="glass-dark p-4 rounded-t-2xl flex justify-between items-center border-b border-gray-700 bg-gradient-to-r from-yellow-600/20 to-rose-600/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                <img 
                  src="/images/ai-coach.png" 
                  alt="AI Coach" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-white">AI Coach</h3>
                <p className="text-xs text-green-400">● Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="glass p-2 rounded-lg hover:bg-red-600 hover:bg-opacity-40 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Welcome Message */}
            <div className="flex gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                <img 
                  src="/images/ai-coach.png" 
                  alt="AI Coach" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="glass px-4 py-2 rounded-2xl rounded-tl-none max-w-[80%]">
                <p className="text-sm text-white">
                  Hey {username}! 👋 I'm your AI strategy coach. Ask me anything about casino games, strategies, or odds!
                </p>
              </div>
            </div>

            {/* Chat Messages */}
            {chatMessages.map((msg, index) => (
              <div key={index} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                    <img 
                      src="/images/ai-coach.png" 
                      alt="AI Coach" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-yellow-500 to-rose-600 text-white rounded-tr-none' 
                    : 'glass rounded-tl-none text-white'
                }`}>
                  {msg.isLoading ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl animate-bounce" style={{ animationDelay: '0s' }}>♠</span>
                        <span className="text-2xl animate-bounce text-red-500" style={{ animationDelay: '0.1s' }}>♥</span>
                        <span className="text-2xl animate-bounce text-red-500" style={{ animationDelay: '0.2s' }}>♦</span>
                        <span className="text-2xl animate-bounce" style={{ animationDelay: '0.3s' }}>♣</span>
                      </div>
                      <span className="text-xs text-gray-400 text-center animate-pulse">AI is thinking...</span>
                    </div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          </div>

                    {/* Input */}
          <div className="glass-dark p-4 rounded-b-2xl border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 glass px-4 py-2 rounded-lg text-white text-sm focus:ring-2 focus:ring-rose-400 outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="bg-gradient-to-r from-yellow-500 to-rose-600 text-white p-2 rounded-lg hover:from-yellow-600 hover:to-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div> 
        </div> 
      </>
)}
    </>
  );
}

export default AIAssistantGreeting;
