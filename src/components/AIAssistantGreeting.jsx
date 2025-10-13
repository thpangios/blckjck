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
        .from('profiles')
        .select('username')
        .eq('user_id', user.id)
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
    setMessage('');

    // Simple AI response (you can connect to your n8n webhook here)
    setTimeout(() => {
      const aiResponse = {
        role: 'assistant',
        content: getAIResponse(message)
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const getAIResponse = (userMessage) => {
    const lower = userMessage.toLowerCase();
    
    if (lower.includes('blackjack')) {
      return "Blackjack is a great choice! 🃏 Remember: Basic strategy is your foundation. Would you like me to explain card counting?";
    } else if (lower.includes('baccarat')) {
      return "Baccarat is elegant and strategic! 🎰 Focus on banker bets for the lowest house edge. Need help with pattern recognition?";
    } else if (lower.includes('poker')) {
      return "Poker requires skill and patience! 🎴 Let's work on optimal hand selection and strategy!";
    } else if (lower.includes('help') || lower.includes('start')) {
      return "I'm here to help! 💪 Pick any game and I'll guide you through strategies, odds, and winning techniques. What interests you?";
    } else {
      return "That's a great question! 🤔 I can help you with game strategies, odds calculations, and training tips. What would you like to know?";
    }
  };

  return (
    <>
      {/* Greeting Popup */}
      {showGreeting && !isOpen && (
        <div className="fixed bottom-24 right-6 z-40 animate-fade-in-up">
          <div className="glass-strong rounded-2xl p-6 max-w-sm shadow-2xl border border-yellow-400/30">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <Sparkles size={20} className="text-black" />
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
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-4 py-2 rounded-lg font-semibold text-sm hover:from-yellow-600 hover:to-yellow-700 transition-all"
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
          className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center group"
        >
          <MessageCircle size={28} className="text-black" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-40 w-96 h-[500px] glass-strong rounded-2xl shadow-2xl flex flex-col animate-fade-in-up">
          
          {/* Header */}
          <div className="glass-dark p-4 rounded-t-2xl flex justify-between items-center border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <Sparkles size={16} className="text-black" />
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
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <Sparkles size={14} className="text-black" />
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
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                    <Sparkles size={14} className="text-black" />
                  </div>
                )}
                <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-tr-none' 
                    : 'glass rounded-tl-none text-white'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="glass-dark p-4 rounded-b-2xl border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 glass px-4 py-2 rounded-lg text-white text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black p-2 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AIAssistantGreeting;
