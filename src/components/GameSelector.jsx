import React from 'react';
import { motion } from 'framer-motion';

function GameSelector({ onSelectGame }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { y: 40, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen casino-background flex items-center justify-center p-4">
      <div className="max-w-7xl w-full">
        
        {/* Casino Logo/Header */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-6">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-casino-gold via-yellow-500 to-casino-gold-dark flex items-center justify-center shadow-2xl border-4 border-white/20">
              <span className="text-6xl">👑</span>
            </div>
          </div>
          <h1 className="text-7xl md:text-8xl font-display font-black neon-text-premium mb-4 tracking-wider">
            ROYAL CASINO
          </h1>
          <p className="text-2xl md:text-3xl font-elegant text-casino-gold tracking-widest">
            Elite Gaming Experience
          </p>
          <div className="w-64 h-1 bg-gradient-to-r from-transparent via-casino-gold to-transparent mx-auto mt-6"></div>
        </motion.div>

        {/* Game Cards */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          
          {/* Blackjack */}
          <motion.button
            variants={item}
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectGame('blackjack')}
            className="group glass-premium rounded-3xl p-8 hover:glass-premium-strong transition-all duration-300 border-2 border-casino-gold/30 hover:border-casino-gold relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-casino-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10">
              <div className="text-7xl mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all">
                🃏
              </div>
              <h2 className="text-4xl font-heading font-bold text-casino-gold mb-4 tracking-wider">
                BLACKJACK
              </h2>
              <p className="text-gray-300 mb-6 font-body">
                Master the art of 21 with card counting, strategy hints, and professional training
              </p>
              <div className="flex justify-center gap-3 text-4xl">
                <span className="transform group-hover:scale-125 transition-transform">♠</span>
                <span className="text-red-500 transform group-hover:scale-125 transition-transform delay-75">♥</span>
                <span className="text-red-500 transform group-hover:scale-125 transition-transform delay-150">♦</span>
                <span className="transform group-hover:scale-125 transition-transform delay-200">♣</span>
              </div>
            </div>
          </motion.button>

          {/* Baccarat */}
          <motion.button
            variants={item}
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectGame('baccarat')}
            className="group glass-premium rounded-3xl p-8 hover:glass-premium-strong transition-all duration-300 border-2 border-casino-gold/30 hover:border-casino-gold relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-casino-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10">
              <div className="text-7xl mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all">
                🎰
              </div>
              <h2 className="text-4xl font-heading font-bold text-casino-gold mb-4 tracking-wider">
                BACCARAT
              </h2>
              <p className="text-gray-300 mb-6 font-body">
                Experience authentic roadmaps, pattern analysis, and Macau-style gameplay
              </p>
              <div className="flex justify-center gap-3 text-4xl">
                <span className="transform group-hover:scale-125 transition-transform">♠</span>
                <span className="text-red-500 transform group-hover:scale-125 transition-transform delay-75">♥</span>
                <span className="text-red-500 transform group-hover:scale-125 transition-transform delay-150">♦</span>
                <span className="transform group-hover:scale-125 transition-transform delay-200">♣</span>
              </div>
            </div>
          </motion.button>

          {/* Video Poker */}
          <motion.button
            variants={item}
            whileHover={{ scale: 1.05, y: -10 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectGame('videopoker')}
            className="group glass-premium rounded-3xl p-8 hover:glass-premium-strong transition-all duration-300 border-2 border-casino-gold/30 hover:border-casino-gold relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-casino-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10">
              <div className="text-7xl mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all">
                🎴
              </div>
              <h2 className="text-4xl font-heading font-bold text-casino-gold mb-4 tracking-wider">
                VIDEO POKER
              </h2>
              <p className="text-gray-300 mb-6 font-body">
                Perfect your strategy with optimal play analysis and multiple game variants
              </p>
              <div className="flex justify-center gap-3 text-4xl">
                <span className="transform group-hover:scale-125 transition-transform">♠</span>
                <span className="text-red-500 transform group-hover:scale-125 transition-transform delay-75">♥</span>
                <span className="text-red-500 transform group-hover:scale-125 transition-transform delay-150">♦</span>
                <span className="transform group-hover:scale-125 transition-transform delay-200">♣</span>
              </div>
            </div>
          </motion.button>

        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16 text-gray-400 text-sm font-body"
        >
          <div className="glass-premium inline-block px-8 py-4 rounded-full">
            <p className="font-semibold text-casino-gold mb-1">Professional Casino Training Simulator</p>
            <p>Practice strategies • Track statistics • Master the games</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default GameSelector;
