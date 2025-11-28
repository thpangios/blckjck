import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader, Sparkles } from 'lucide-react';
import { sendToAICoach } from '../utils/aiCoachService';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext'; // ✅ ADD THIS
import { v4 as uuidv4 } from 'uuid';

function AICoach({ game, gameState, visible = true }) {
  const { user } = useAuth();
  const { canAccessAICoach } = useSubscription(); // ✅ ADD THIS
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [sessionId] = useState(() => uuidv4()); // Generate unique session ID
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Quick suggestion buttons
  const quickSuggestions = [
    { label: '💡 Why this play?', question: 'Why does the strategy recommend this action?' },
    { label: '📊 Explain the math', question: 'Can you explain the mathematical reasoning behind this decision?' },
    { label: '🎯 What\'s my edge?', question: 'What is my advantage in this situation?' },
    { label: '🔄 Show alternatives', question: 'What are the alternative plays and their expected values?' },
  ];

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendToAICoach({
        message: messageText,
        game,
        gameState,
        chatHistory: messages,
        sessionId, // Pass session ID
        userId: user?.id // Pass user ID
      });
      const aiMessage = {
        role: 'assistant',
        content: response.answer,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('AI Coach error:', err);
      setError('Sorry, I couldn\'t process that. Please try again.');
      
      // Remove user message if AI failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSuggestion = (question) => {
    handleSendMessage(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  if (!visible) return null;

  // ✅ Block free users
if (!canAccessAICoach()) {
  return null; // Don't show AI Coach at all for free users
}

  return (
    <>
      {/* Floating Button */}
{!isOpen && (
  <button
  onClick={() => setIsOpen(true)}
  className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 group animate-bounce-subtle overflow-hidden border-2 border-purple-500"
  aria-label="Open AI Coach"
>
  <img 
    src="/images/ai-coach.png" 
    alt="AI Coach" 
    className="w-full h-full object-cover"
  />
  {/* Pulse animation */}
  <div className="absolute inset-0 rounded-full bg-purple-400 opacity-0 group-hover:opacity-30 animate-ping"></div>
</button>
)}

     {/* Chat Modal */}
{isOpen && (
  <>
    {/* Backdrop for click-outside-to-close */}
    <div 
      className="fixed inset-0 z-49"
      onClick={() => setIsOpen(false)}
    />
    
    {/* Chat Window */}
    <div className="fixed bottom-6 right-6 z-50 w-[450px] h-[650px] flex flex-col bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-purple-500/30 animate-scale-in">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-purple-900/50 to-purple-800/50 rounded-t-2xl">
       <div className="flex items-center gap-3">
  <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 border-purple-500">
    <img 
      src="/images/ai-coach.png" 
      alt="AI Coach" 
      className="w-full h-full object-cover"
    />
  </div>
  <div>
    <h3 className="font-bold text-white">AI Strategy Coach</h3>
    <p className="text-xs text-gray-400 capitalize">{game} Expert</p>
  </div>
</div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/50">
            
           {/* Welcome Message */}
{messages.length === 0 && (
  <div className="text-center py-8">
    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden border-2 border-purple-500">
      <img 
        src="/images/ai-coach.png" 
        alt="AI Coach" 
        className="w-full h-full object-cover"
      />
    </div>
    <h4 className="text-lg font-bold text-white mb-2">Ask Me Anything!</h4>
                <p className="text-sm text-gray-400 mb-4">
                  I'm here to explain strategies, odds, and help you improve your game.
                </p>
                
                {/* Quick Suggestions */}
                <div className="grid grid-cols-2 gap-2 mt-6">
                  {quickSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickSuggestion(suggestion.question)}
                      className="text-xs px-3 py-2 bg-gray-800 hover:bg-purple-700 text-white rounded-lg transition-all hover:scale-105 border border-gray-700"
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
{messages.map((message, index) => (
  <div
    key={index}
    className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
  >
    {/* AI Avatar (only for assistant messages) */}
    {message.role === 'assistant' && (
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border border-purple-500">
        <img 
          src="/images/ai-coach.png" 
          alt="AI Coach" 
          className="w-full h-full object-cover"
        />
      </div>
    )}
    
    <div
      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        message.role === 'user'
          ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white'
          : 'bg-gray-800 text-gray-100 border border-gray-700'
      }`}
    >
      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      <span className="text-xs opacity-60 mt-1 block">
        {new Date(message.timestamp).toLocaleTimeString()}
      </span>
    </div>
  </div>
))}

          {/* Loading Indicator - Card Suits Animation */}
{isLoading && (
  <div className="flex gap-2 justify-start">
    {/* AI Avatar */}
    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border border-purple-500">
      <img 
        src="/images/ai-coach.png" 
        alt="AI Coach" 
        className="w-full h-full object-cover"
      />
    </div>
    
    <div className="bg-gray-800 rounded-2xl px-6 py-4 border border-gray-700">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl animate-bounce" style={{ animationDelay: '0s' }}>♠</span>
                      <span className="text-2xl animate-bounce text-red-500" style={{ animationDelay: '0.1s' }}>♥</span>
                      <span className="text-2xl animate-bounce text-red-500" style={{ animationDelay: '0.2s' }}>♦</span>
                      <span className="text-2xl animate-bounce" style={{ animationDelay: '0.3s' }}>♣</span>
                    </div>
                    <span className="text-sm text-gray-400 text-center animate-pulse">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            {/* Error Message */}
            {error && (
              <div className="bg-red-900/30 border border-red-500 rounded-lg px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-700 bg-gray-900/80">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about strategy..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={isLoading || !inputValue.trim()}
                className="px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
    </>
      )}
    </>
  );
}

export default AICoach;
