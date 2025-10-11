import React from 'react';
import { motion } from 'framer-motion';

function GameSelector({ onSelectGame }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const item = {
    hidden: { y: 30, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
    }
  };

  return (
    <div className="min-h-screen bg-casino-gradient flex items-center justify-center p-6">
      <div className="max-w-7xl w-full">
        
        {/* Logo & Header */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="text-center mb-20"
        >
          {/* Crown Logo */}
          <motion.div 
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block mb-8"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-casino-gold-400 via-casino-gold-500 to-casino-gold-700 flex items-center justify-center shadow-glow-strong">
              <span className="text-5xl">👑</span>
            </div>
          </motion.div>

          {/* Title */}
          <h1 className="text-7xl md:text-8xl font-display font-black text-glow-strong text-casino-gold-500 mb-4 tracking-wider">
            ROYAL CASINO
          </h1>
          
          {/* Subtitle */}
          <p className="text-2xl md:text-3xl font-elegant text-casino-gold-600 tracking-widest mb-6">
            Elite Gaming Experience
          </p>

          {/* Divider */}
          <div className="w-64 h-px bg-gradient-to-r from-transparent via-casino-gold-500 to-transparent mx-auto"></div>
        </motion.div>

        {/* Game Cards Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-3 gap-8"
        >
          
          {/* Blackjack Card */}
          <GameCard
            variants={item}
            icon="🃏"
            title="BLACKJACK"
            description="Master 21 with card counting and strategy analysis"
            onClick={() => onSelectGame('blackjack')}
          />

          {/* Baccarat Card */}
          <GameCard
            variants={item}
            icon="🎰"
            title="BACCARAT"
            description="Experience authentic roadmaps and pattern tracking"
            onClick={() => onSelectGame('baccarat')}
          />

          {/* Video Poker Card */}
          <GameCard
            variants={item}
            icon="🎴"
            title="VIDEO POKER"
            description="Perfect your strategy with optimal play guidance"
            onClick={() => onSelectGame('videopoker')}
          />

        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="glass inline-block px-8 py-4 rounded-full">
            <p className="text-casino-gold-500 font-semibold text-sm tracking-wide mb-1">
              PROFESSIONAL TRAINING SIMULATOR
            </p>
            <p className="text-casino-gray-400 text-xs">
              Practice Strategies • Track Statistics • Master The Games
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// === GAME CARD COMPONENT (CONSISTENT STYLING) ===
function GameCard({ variants, icon, title, description, onClick }) {
  return (
    <motion.button
      variants={variants}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group glass-strong rounded-2xl p-8 hover:border-casino-gold-500 transition-all duration-normal relative overflow-hidden"
    >
      {/* Hover Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-casino-gold-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-normal"></div>
      
      <div className="relative z-10">
        {/* Icon */}
        <motion.div 
          className="text-7xl mb-6"
          whileHover={{ 
            scale: 1.1, 
            rotate: 6,
            transition: { duration: 0.3 }
          }}
        >
          {icon}
        </motion.div>

        {/* Title */}
        <h2 className="text-4xl font-heading font-bold text-casino-gold-500 mb-4 tracking-wider">
          {title}
        </h2>

        {/* Description */}
        <p className="text-casino-gray-300 font-body text-base mb-6">
          {description}
        </p>

        {/* Suit Icons */}
        <div className="flex justify-center gap-3 text-3xl">
          {['♠', '♥', '♦', '♣'].map((suit, i) => (
            <motion.span
              key={suit}
              className={suit === '♥' || suit === '♦' ? 'text-red-500' : ''}
              whileHover={{ 
                scale: 1.2,
                transition: { delay: i * 0.05 }
              }}
            >
              {suit}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.button>
  );
}

export default GameSelector;
