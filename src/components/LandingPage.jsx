import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, Shield, Brain, BarChart3, Zap, Target, 
  CheckCircle, ArrowRight, Star, Users, Award, Lock,
  Sparkles, ChevronDown, Play
} from 'lucide-react';
import PricingPage from './PricingPage';

// Custom hook for scroll-triggered animations
function useInView(options = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        // Once animated, stop observing
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      }
    }, {
      threshold: 0.1,
      ...options
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return [ref, isInView];
}

function LandingPage({ onGetStarted }) {
  const [scrolled, setScrolled] = useState(false);
  const [showPricing, setShowPricing] = useState(false); // ADD THIS

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      
{/* Floating Navigation */}
<nav
  className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    scrolled ? 'glass-dark py-4 shadow-2xl' : 'py-6'
  }`}
>
  <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
    <div className="flex items-center gap-3 -mt-[2px] ml-2">
      <img
        src="/images/ace-edge-logo.png"
        alt="Ace Edge Logo"
        className="h-20 w-auto"
      />
      <span className="text-2xl font-bold player-label">ACE EDGE</span>
    </div>

<div className="flex items-center gap-4">
  <a 
    href="/blog"
    className="text-gray-300 hover:text-yellow-400 transition-colors font-semibold"
  >
    Blog
  </a>

  <button
    onClick={() => setShowPricing(true)}
    className="hidden md:block glass px-6 py-3 rounded-xl font-bold hover:bg-white hover:bg-opacity-10 transition-all"
  >
    Pricing
  </button>

  <button
    onClick={onGetStarted}
    className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-6 py-3 rounded-xl font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all hover:scale-105 shadow-lg flex items-center gap-2"
  >
    Get Started <ArrowRight size={18} />
  </button>
</div>

  </div>
</nav>


      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
        {/* Animated background suits */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 text-9xl animate-float">♠</div>
          <div className="absolute top-40 right-20 text-9xl text-red-500 animate-float" style={{ animationDelay: '1s' }}>♥</div>
          <div className="absolute bottom-40 left-40 text-9xl text-red-500 animate-float" style={{ animationDelay: '2s' }}>♦</div>
          <div className="absolute bottom-20 right-40 text-9xl animate-float" style={{ animationDelay: '3s' }}>♣</div>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="inline-block mb-6 px-4 py-2 glass rounded-full text-yellow-400 font-semibold text-sm animate-fade-in-up">
            🏆 Professional Casino Training Platform
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Master Casino Games
            <br />
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
              With AI-Powered Strategy
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Train like a pro with real-time strategy guidance, advanced card counting, 
            and AI coaching. Turn the odds in your favor.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-8 py-4 rounded-xl font-bold text-lg hover:from-yellow-600 hover:to-yellow-700 transition-all hover:scale-105 shadow-2xl flex items-center justify-center gap-2"
            >
              <Play size={20} />
              Start Training Free
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="glass-strong px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:bg-opacity-10 transition-all flex items-center justify-center gap-2"
            >
              See Features
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <StatCard number="99.54%" label="Max RTP" />
            <StatCard number="4" label="Casino Games" />
            <StatCard number="AI" label="Strategy Coach" />
            <StatCard number="Real-time" label="Guidance" />
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <ProblemSection />

      {/* Solution Section with Chart */}
      <SolutionSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Game Showcase */}
      <GameShowcaseSection />

      {/* Trust Badges */}
      <TrustSection />

      {/* Final CTA */}
      <CTASection onGetStarted={onGetStarted} />

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
  <img 
    src="/images/ace-edge-logo.png" 
    alt="Ace Edge Logo" 
    className="h-16 w-auto"
  />
  <span className="text-xl font-bold player-label">ACE EDGE</span>
</div>
            
            <p className="text-gray-400 text-sm text-center">
              © 2025 Ace Edge. Professional casino training platform. 
              <br className="md:hidden" />
              Train responsibly.
            </p>
          </div>
        </div>
      </footer>
      {/* Pricing Modal */}
      {showPricing && (
        <PricingPage 
          onClose={() => setShowPricing(false)}
          onSelectPlan={(plan) => {
            console.log('Selected plan:', plan);
            setShowPricing(false);
            onGetStarted(); // Redirect to signup
          }}
        />
      )}
    </div>
  );
}


// Animated Sections

function ProblemSection() {
  const [ref, isInView] = useInView();

  return (
    <section ref={ref} className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className={`glass-strong rounded-3xl p-12 md:p-20 relative overflow-hidden transition-all duration-1000 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-900/20 to-transparent" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              The Casino Always Wins...
              <span className="text-red-400"> Unless You Know The Math</span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl">
              Most players lose because they don't understand optimal strategy. 
              Even small mistakes cost thousands over time. The house edge compounds against you.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <ProblemCard
                icon="📉"
                title="Poor Strategy"
                description="Playing on gut feeling instead of mathematics costs 2-5% edge"
              />
              <ProblemCard
                icon="🎲"
                title="No Training"
                description="Casino experience is expensive. Mistakes cost real money."
              />
              <ProblemCard
                icon="❓"
                title="Confusing Rules"
                description="Complex strategies without clear explanations lead to errors."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SolutionSection() {
  const [ref, isInView] = useInView();

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-transparent via-green-900/10 to-transparent">
      <div className="max-w-7xl mx-auto px-6">
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Train Smart. Play Better. <span className="text-green-400">Win More.</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Our AI-powered platform reduces the house edge to near zero through perfect strategy execution.
          </p>
        </div>

        {/* House Edge Comparison Chart */}
        <div className={`glass-strong rounded-3xl p-8 md:p-12 mb-12 transition-all duration-1000 delay-200 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}>
          <h3 className="text-2xl font-bold mb-8 text-center">House Edge: Average Player vs. Ace Edge Trained</h3>
          
          <div className="space-y-6">
            <ComparisonBar
              game="Blackjack"
              averagePlayer={2.0}
              trained={0.5}
              optimal={0.5}
              animate={isInView}
            />
            <ComparisonBar
              game="Video Poker"
              averagePlayer={3.5}
              trained={0.46}
              optimal={0.46}
              animate={isInView}
            />
            <ComparisonBar
              game="Baccarat"
              averagePlayer={1.24}
              trained={1.06}
              optimal={1.06}
              animate={isInView}
            />
            <ComparisonBar
              game="Pai Gow"
              averagePlayer={2.5}
              trained={1.46}
              optimal={1.46}
              animate={isInView}
            />
          </div>

          <div className="flex justify-center gap-8 mt-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Average Player</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Ace Edge Trained</span>
            </div>
          </div>

          <p className="text-center text-gray-400 mt-6 text-sm">
            * Lower house edge = Better odds for you. Our training reduces your disadvantage by up to 75%.
          </p>
        </div>

        {/* ROI Calculator */}
        <div className={`transition-all duration-1000 delay-400 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}>
          <ROICalculator />
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const [ref, isInView] = useInView();

  return (
    <section id="features" ref={ref} className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Professional-Grade Training Tools
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Everything you need to master casino games, backed by mathematics and AI.
          </p>
        </div>

        <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-1000 delay-200 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}>
          <FeatureCard
            icon={<Brain size={32} className="text-purple-400" />}
            title="AI Strategy Coach"
            description="Real-time explanations for every decision. Ask questions and get instant, contextual answers powered by advanced AI."
            badge="NEW"
          />
          
          <FeatureCard
            icon={<BarChart3 size={32} className="text-blue-400" />}
            title="Card Counting System"
            description="Learn Hi-Lo counting with true count calculation, penetration tracking, and optimal bet sizing recommendations."
          />
          
          <FeatureCard
            icon={<Target size={32} className="text-green-400" />}
            title="Optimal Strategy Engine"
            description="Perfect play recommendations for every situation. Never make a costly mistake again with our real-time guidance."
          />
          
          <FeatureCard
            icon={<TrendingUp size={32} className="text-yellow-400" />}
            title="Advanced Analytics"
            description="Track your progress, identify weaknesses, and watch your win rate improve with detailed statistics and insights."
          />
          
          <FeatureCard
            icon={<Shield size={32} className="text-red-400" />}
            title="Risk-Free Training"
            description="Practice with virtual currency. Master strategies without risking real money. Build confidence before playing live."
          />
          
          <FeatureCard
            icon={<Zap size={32} className="text-orange-400" />}
            title="4 Casino Games"
            description="Blackjack, Baccarat, Video Poker, and Pai Gow Poker. Each with authentic rules and professional training modes."
          />
        </div>
      </div>
    </section>
  );
}

function GameShowcaseSection() {
  const [ref, isInView] = useInView();

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-transparent via-gray-800/20 to-transparent">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className={`text-4xl md:text-5xl font-bold mb-16 text-center transition-all duration-1000 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}>
          Master Every Game
        </h2>

        <div className={`grid md:grid-cols-2 gap-8 transition-all duration-1000 delay-200 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}>
          <GameCard
            title="♠ Blackjack"
            description="Card counting, true count tracking, basic strategy, and bankroll management"
            stats={["99.5% RTP", "Hi-Lo System", "Real-time Count"]}
          />
          
          <GameCard
            title="🎰 Video Poker"
            description="Optimal hold strategy, EV calculations, and variant-specific training"
            stats={["99.54% RTP", "3 Variants", "Perfect Strategy"]}
          />
          
          <GameCard
            title="🎴 Baccarat"
            description="Pattern recognition, roadmaps, and trend analysis with 5 tracking systems"
            stats={["98.94% RTP", "5 Roadmaps", "Pattern AI"]}
          />
          
          <GameCard
            title="🀄 Pai Gow Poker"
            description="House way algorithm, optimal hand setting, and fortune bonus strategy"
            stats={["98.54% RTP", "Hand Setting AI", "Low Variance"]}
          />
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  const [ref, isInView] = useInView();

  return (
    <section ref={ref} className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto transition-all duration-1000 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}>
          <TrustBadge icon={<Shield />} text="Secure & Private" />
          <TrustBadge icon={<Users />} text="1000+ Players" />
          <TrustBadge icon={<Award />} text="Pro-Grade Tools" />
          <TrustBadge icon={<Lock />} text="Risk-Free Training" />
        </div>
      </div>
    </section>
  );
}

function CTASection({ onGetStarted }) {
  const [ref, isInView] = useInView();

  return (
    <section ref={ref} className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 via-orange-600/20 to-red-600/20" />
      
      <div className={`max-w-4xl mx-auto px-6 text-center relative z-10 transition-all duration-1000 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}>
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          Ready to Beat the House?
        </h2>
        
        <p className="text-xl text-gray-300 mb-8">
          Join Ace Edge today and start training like a professional. 
          Free to start, no credit card required.
        </p>

        <button
          onClick={onGetStarted}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-12 py-5 rounded-xl font-bold text-xl hover:from-yellow-600 hover:to-yellow-700 transition-all hover:scale-105 shadow-2xl inline-flex items-center gap-3"
        >
          <Play size={24} />
          Start Training Now
          <ArrowRight size={24} />
        </button>

        <p className="text-sm text-gray-400 mt-6">
          ✓ No credit card required  ✓ Start in 30 seconds  ✓ Risk-free training
        </p>
      </div>
    </section>
  );
}

// Helper Components

function StatCard({ number, label }) {
  return (
    <div className="glass rounded-2xl p-6 text-center hover:scale-105 transition-transform">
      <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">{number}</div>
      <div className="text-gray-400 text-sm">{label}</div>
    </div>
  );
}

function ProblemCard({ icon, title, description }) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function ComparisonBar({ game, averagePlayer, trained, optimal, animate }) {
  const maxValue = 5;
  const avgWidth = (averagePlayer / maxValue) * 100;
  const trainedWidth = (trained / maxValue) * 100;

  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="font-semibold">{game}</span>
        <span className="text-sm text-gray-400">House Edge %</span>
      </div>
      
      <div className="relative h-12 bg-gray-800 rounded-xl overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-end pr-3 transition-all duration-1000"
          style={{ width: animate ? `${avgWidth}%` : '0%' }}
        >
          {animate && <span className="text-xs font-bold text-white">{averagePlayer}%</span>}
        </div>
        
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-end pr-3 transition-all duration-1000 delay-300"
          style={{ width: animate ? `${trainedWidth}%` : '0%' }}
        >
          {animate && <span className="text-xs font-bold text-white">{trained}%</span>}
        </div>
      </div>
    </div>
  );
}

function ROICalculator() {
  const [hours, setHours] = React.useState(100);
  const [betSize, setBetSize] = React.useState(25);
  
  const handsPerHour = 60;
  const totalHands = hours * handsPerHour;
  const totalWagered = totalHands * betSize;
  
  const avgPlayerLoss = totalWagered * 0.02; // 2% house edge
  const trainedLoss = totalWagered * 0.005; // 0.5% house edge
  const savings = avgPlayerLoss - trainedLoss;

  return (
    <div className="glass-strong rounded-3xl p-8 md:p-12">
      <h3 className="text-2xl font-bold mb-8 text-center">See Your Potential Savings</h3>
      
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <label className="block text-sm font-semibold mb-2">Hours Played Per Year</label>
          <input
            type="range"
            min="10"
            max="500"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-2xl font-bold text-yellow-400 mt-2">{hours} hours</div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2">Average Bet Size</label>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={betSize}
            onChange={(e) => setBetSize(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-2xl font-bold text-yellow-400 mt-2">${betSize}</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 text-center">
        <div className="glass rounded-2xl p-6">
          <div className="text-sm text-gray-400 mb-2">Without Training</div>
          <div className="text-3xl font-bold text-red-400">-${avgPlayerLoss.toFixed(0)}</div>
          <div className="text-xs text-gray-500 mt-1">Expected Loss</div>
        </div>
        
        <div className="glass rounded-2xl p-6">
          <div className="text-sm text-gray-400 mb-2">With Ace Edge</div>
          <div className="text-3xl font-bold text-orange-400">-${trainedLoss.toFixed(0)}</div>
          <div className="text-xs text-gray-500 mt-1">Expected Loss</div>
        </div>
        
        <div className="glass rounded-2xl p-6 ring-2 ring-green-500">
          <div className="text-sm text-gray-400 mb-2">You Save</div>
          <div className="text-3xl font-bold text-green-400">+${savings.toFixed(0)}</div>
          <div className="text-xs text-gray-500 mt-1">Per Year</div>
        </div>
      </div>

      <p className="text-center text-gray-400 text-sm mt-6">
        💡 Training with Ace Edge pays for itself in just a few sessions
      </p>
    </div>
  );
}

function FeatureCard({ icon, title, description, badge }) {
  return (
    <div className="glass-strong rounded-2xl p-8 hover:scale-105 transition-all group relative overflow-hidden">
      {badge && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-purple-700 text-xs font-bold px-3 py-1 rounded-full">
          {badge}
        </div>
      )}
      
      <div className="mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function GameCard({ title, description, stats }) {
  return (
    <div className="glass-strong rounded-2xl p-8 hover:scale-105 transition-all">
      <h3 className="text-3xl font-bold mb-4">{title}</h3>
      <p className="text-gray-400 mb-6">{description}</p>
      
      <div className="flex flex-wrap gap-3">
        {stats.map((stat, i) => (
          <span key={i} className="glass px-4 py-2 rounded-full text-sm font-semibold text-yellow-400">
            {stat}
          </span>
        ))}
      </div>
    </div>
  );
}

function TrustBadge({ icon, text }) {
  return (
    <div className="glass rounded-2xl p-4 flex flex-col items-center gap-2">
      <div className="text-yellow-400">{icon}</div>
      <div className="text-sm font-semibold text-center">{text}</div>
    </div>
  );
}

export default LandingPage;
