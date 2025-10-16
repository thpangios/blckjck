import React, { useState, useEffect } from "react";
import { MessageCircle, Send, X, Sparkles, Lock, Crown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { useSubscription } from "../contexts/SubscriptionContext";

function AIAssistantGreeting() {
  const { user } = useAuth();
  const { canAccessAICoach, planType } = useSubscription();

  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [username, setUsername] = useState("Player");
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Load user profile and auto-show greeting
  useEffect(() => {
    if (user) {
      loadUserProfile();
      setTimeout(() => setShowGreeting(true), 1000);
      setTimeout(() => setShowGreeting(false), 7000);
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const { data } = await supabase
        .from("users")
        .select("username")
        .eq("id", user.id)
        .single();

      if (data?.username) setUsername(data.username);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12)
      return `Good morning, ${username}! ☀️ Ready to start training?`;
    if (hour < 18)
      return `Good afternoon, ${username}! 🌤️ Let's practice some winning strategies!`;
    return `Good evening, ${username}! 🌙 Perfect time to master your game!`;
  };

  const getAIFallback = (userMessage) => {
    const lower = userMessage.toLowerCase();
    if (lower.includes("blackjack"))
      return "For Blackjack, master basic strategy first, then learn Hi-Lo card counting. The key is discipline! 🃏";
    if (lower.includes("baccarat"))
      return "In Baccarat, always bet on Banker for the lowest house edge (1.06%). Avoid the Tie bet! 🎰";
    if (lower.includes("poker"))
      return "Video Poker rewards perfect play. Study hand rankings and hold strategies for 99%+ RTP! 🎴";
    if (lower.includes("help") || lower.includes("start"))
      return "Choose any game and I'll guide you through winning strategies! Each game has unique advantages. 💪";
    return "I can help with game strategies, odds, and training tips. What game interests you most? 🎯";
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { role: "user", content: message };
    const userQuestion = message;
    setChatMessages([...chatMessages, userMsg]);
    setMessage("");

    // Add loading placeholder
    setChatMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", isLoading: true },
    ]);

    try {
      const response = await fetch(
        "https://n8n-railway-production-cc19.up.railway.app/webhook/ai-coach",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userQuestion,
            game: "general",
            chatHistory: chatMessages.slice(-10),
            timestamp: new Date().toISOString(),
            context: "game_selector",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to get AI response");
      const data = await response.json();

      let answerText =
        (Array.isArray(data) && data[0]?.output) ||
        data.output ||
        data.answer ||
        data.message ||
        "I received your question but had trouble generating a response.";

      setChatMessages((prev) => [
        ...prev.filter((msg) => !msg.isLoading),
        { role: "assistant", content: answerText },
      ]);
    } catch (error) {
      console.error("AI Coach error:", error);
      setChatMessages((prev) => [
        ...prev.filter((msg) => !msg.isLoading),
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Here's a quick tip: " +
            getAIFallback(userQuestion),
        },
      ]);
    }
  };

  const handleLockedClick = () => setShowUpgradeModal(true);

  return (
    <>
      {/* Greeting Popup */}
      {showGreeting && !isOpen && (
        <div className="fixed bottom-24 right-6 z-40 animate-fade-in-up">
          <div className="glass-strong rounded-2xl p-6 max-w-sm shadow-2xl border border-rose-400/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden">
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

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={canAccessAICoach() ? () => setIsOpen(true) : handleLockedClick}
          className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl z-40 transition-all duration-300 hover:scale-110 group ${
            canAccessAICoach()
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              : "bg-gradient-to-r from-gray-600 to-gray-700 cursor-pointer"
          }`}
          title={
            canAccessAICoach()
              ? "Open AI Assistant"
              : "Upgrade to unlock AI Coach"
          }
        >
          <div className="relative">
            {canAccessAICoach() ? (
              <>
                <MessageCircle size={28} className="text-white" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                </span>
              </>
            ) : (
              <>
                <div className="relative">
                  <MessageCircle size={28} className="text-gray-400" />
                  <Lock
                    size={16}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white bg-red-500 rounded-full p-0.5"
                  />
                </div>
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                  PRO
                </span>
              </>
            )}
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
              {canAccessAICoach() ? (
                "Ask me anything! 💬"
              ) : (
                <div className="flex items-center gap-2">
                  <Lock size={14} />
                  <span>Upgrade to unlock AI Coach</span>
                </div>
              )}
            </div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />

          <div className="fixed bottom-6 right-6 z-40 w-96 max-w-[calc(100vw-3rem)] h-[500px] glass-strong rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: "url(/images/ai-coach.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

            {/* Chat Header */}
            <div className="relative z-10 flex justify-between items-center p-4 border-b border-gray-700 glass-dark bg-gradient-to-r from-yellow-600/20 to-rose-600/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden">
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
            <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img
                    src="/images/ai-coach.png"
                    alt="AI Coach"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="glass px-4 py-2 rounded-2xl rounded-tl-none max-w-[80%]">
                  <p className="text-sm text-white">
                    Hey {username}! 👋 I'm your AI strategy coach. Ask me
                    anything about casino games, strategies, or odds!
                  </p>
                </div>
              </div>

              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${
                    msg.role === "user" ? "justify-end" : ""
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img
                        src="/images/ai-coach.png"
                        alt="AI Coach"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-yellow-500 to-rose-600 text-white rounded-tr-none"
                        : "glass rounded-tl-none text-white"
                    }`}
                  >
                    {msg.isLoading ? (
                      <div className="flex flex-col gap-2 items-center">
                        <div className="flex gap-2">
                          <span className="text-2xl animate-bounce">♠</span>
                          <span className="text-2xl animate-bounce text-red-500">
                            ♥
                          </span>
                          <span className="text-2xl animate-bounce text-red-500">
                            ♦
                          </span>
                          <span className="text-2xl animate-bounce">♣</span>
                        </div>
                        <span className="text-xs text-gray-400 animate-pulse">
                          AI is thinking...
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Field */}
            <div className="glass-dark p-4 border-t border-gray-700 rounded-b-2xl relative z-10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
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

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full border-2 border-purple-500 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-purple-600 p-3 rounded-full">
                  <Crown size={24} className="text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  AI Coach Locked
                </h3>
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-gray-300 text-lg">
                Get instant AI-powered strategy coaching and explanations!
              </p>

              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                {[
                  "Real-time strategy explanations",
                  "Ask questions about any hand",
                  "Learn optimal plays instantly",
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Sparkles
                      size={20}
                      className="text-purple-400 mt-0.5 flex-shrink-0"
                    />
                    <p className="text-gray-300 text-sm">{text}</p>
                  </div>
                ))}
              </div>

              <div className="bg-purple-600/20 border border-purple-500/50 rounded-lg p-4">
                <p className="text-purple-300 text-sm text-center">
                  Available with{" "}
                  <span className="font-bold text-yellow-400">Ace Plan</span> or{" "}
                  <span className="font-bold text-rose-400">Ace Pro</span>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href="/pricing"
                className="block w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 rounded-lg text-center transition-all hover:scale-105"
              >
                Upgrade Now - From $11.99/mo
              </a>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg text-center transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AIAssistantGreeting;
