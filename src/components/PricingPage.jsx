import React, { useState } from 'react';
import { X, Check, Zap, Crown, Sparkles, ArrowRight } from 'lucide-react';

function PricingPage({ onClose, onSelectPlan }) {
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly or lifetime

  const plans = {
    free: {
      name: 'Free',
      price: 0,
      period: 'forever',
      icon: <Sparkles size={32} className="text-gray-400" />,
      features: [
        { text: 'Access to all 4 games', included: true },
        { text: '5 training rounds per day (total)', included: true },
        { text: 'Basic strategy hints', included: true },
        { text: 'AI Strategy Coach', included: false },
        { text: 'Unlimited training rounds', included: false },
        { text: 'Advanced analytics', included: false },
        { text: 'Card counting tools', included: false },
      ],
      cta: 'Current Plan',
      color: 'gray',
      popular: false
    },
    ace: {
      name: 'Ace Plan',
      price: 11.99,
      period: 'per month',
      icon: <Zap size={32} className="text-yellow-400" />,
      features: [
        { text: 'Access to all 4 games', included: true },
        { text: 'Unlimited training rounds', included: true },
        { text: 'Full AI Strategy Coach', included: true },
        { text: 'Advanced analytics & stats', included: true },
        { text: 'Card counting tools', included: true },
        { text: 'Pattern recognition', included: true },
        { text: 'Priority support', included: true },
      ],
      cta: 'Start Free Trial',
      color: 'yellow',
      popular: true
    },
    lifetime: {
      name: 'Lifetime Access',
      price: billingCycle === 'lifetime' ? 149 : 299,
      originalPrice: 299,
      period: 'one-time payment',
      icon: <Crown size={32} className="text-rose-400" />,
      features: [
        { text: 'Everything in Ace Plan', included: true },
        { text: 'Pay once, own forever', included: true },
        { text: 'All future updates included', included: true },
        { text: 'Early access to new games', included: true },
        { text: 'Exclusive lifetime badge', included: true },
        { text: 'VIP support channel', included: true },
        { text: 'No recurring fees ever', included: true },
      ],
      cta: 'Claim Lifetime Deal',
      color: 'rose',
      popular: false,
      badge: '50% OFF - Launch Offer'
    }
  };

  const handleSelectPlan = (planType) => {
    if (onSelectPlan) {
      onSelectPlan(planType);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in-up overflow-y-auto">
      <div className="glass-strong rounded-3xl max-w-7xl w-full my-8 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 glass p-3 rounded-xl hover:bg-red-600 hover:bg-opacity-40 transition-all z-10"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center p-8 pb-6">
          <div className="inline-flex items-center gap-3 mb-4">
            <img 
              src="/images/ace-edge-logo.png" 
              alt="Ace Edge" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-rose-500 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Master casino games with AI-powered training. Start free, upgrade anytime.
          </p>
        </div>

        {/* Launch Offer Banner */}
        <div className="mx-8 mb-6 bg-gradient-to-r from-rose-600/20 to-yellow-600/20 border border-rose-400/30 rounded-2xl p-4">
          <div className="flex items-center justify-center gap-3 text-center">
            <Crown size={24} className="text-rose-400" />
            <p className="text-white font-semibold">
              🔥 <span className="text-rose-400">LAUNCH OFFER:</span> Get Lifetime Access for 50% OFF - Limited Time Only!
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 p-8 pt-0">
          
          {/* Free Plan */}
          <PricingCard 
            plan={plans.free}
            onSelect={() => handleSelectPlan('free')}
          />

          {/* Ace Plan */}
          <PricingCard 
            plan={plans.ace}
            onSelect={() => handleSelectPlan('ace')}
          />

          {/* Lifetime Plan */}
          <PricingCard 
            plan={plans.lifetime}
            onSelect={() => handleSelectPlan('lifetime')}
          />

        </div>

        {/* Trust Badges */}
        <div className="border-t border-gray-700 p-8 pt-6">
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Check size={18} className="text-green-400" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={18} className="text-green-400" />
              <span>Secure payment with Stripe</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={18} className="text-green-400" />
              <span>Money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={18} className="text-green-400" />
              <span>Instant access</span>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="border-t border-gray-700 p-8 pt-6">
          <h3 className="text-2xl font-bold text-center mb-6 text-yellow-400">Frequently Asked Questions</h3>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto text-sm">
            <FAQItem 
              question="Can I upgrade later?"
              answer="Yes! Upgrade from Free to Ace Plan or Lifetime anytime. Your progress is saved."
            />
            <FAQItem 
              question="What's included in training rounds?"
              answer="Each training round includes AI coaching, strategy hints, and performance tracking."
            />
            <FAQItem 
              question="Is the lifetime deal really forever?"
              answer="Yes! Pay once, access forever. All future updates and new games included."
            />
            <FAQItem 
              question="Can I cancel my subscription?"
              answer="Absolutely. Cancel anytime from your profile settings. No questions asked."
            />
          </div>
        </div>

      </div>
    </div>
  );
}

function PricingCard({ plan, onSelect }) {
  const colorClasses = {
    gray: {
      border: 'border-gray-600',
      gradient: 'from-gray-700 to-gray-800',
      button: 'from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800',
      badge: 'from-gray-600 to-gray-700'
    },
    yellow: {
      border: 'border-yellow-400 ring-2 ring-yellow-400/30',
      gradient: 'from-yellow-600/20 to-rose-600/20',
      button: 'from-yellow-500 to-rose-600 hover:from-yellow-600 hover:to-rose-700',
      badge: 'from-yellow-500 to-rose-600'
    },
    rose: {
      border: 'border-rose-400',
      gradient: 'from-rose-600/20 to-yellow-600/20',
      button: 'from-rose-500 to-yellow-600 hover:from-rose-600 hover:to-yellow-700',
      badge: 'from-rose-500 to-yellow-600'
    }
  };

  const colors = colorClasses[plan.color];

  return (
    <div className={`glass-strong rounded-2xl p-8 border-2 ${colors.border} relative transition-all hover:scale-105 ${plan.popular ? 'transform scale-105' : ''}`}>
      
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className={`bg-gradient-to-r ${colors.badge} px-6 py-2 rounded-full text-sm font-bold text-white shadow-lg`}>
            ⭐ MOST POPULAR
          </div>
        </div>
      )}

      {/* Launch Offer Badge */}
      {plan.badge && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className={`bg-gradient-to-r ${colors.badge} px-6 py-2 rounded-full text-sm font-bold text-white shadow-lg animate-pulse`}>
            {plan.badge}
          </div>
        </div>
      )}

      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className={`w-16 h-16 bg-gradient-to-br ${colors.gradient} rounded-2xl flex items-center justify-center`}>
          {plan.icon}
        </div>
      </div>

      {/* Plan Name */}
      <h3 className="text-2xl font-bold text-center mb-2">{plan.name}</h3>

      {/* Price */}
      <div className="text-center mb-6">
        {plan.originalPrice && (
          <div className="text-gray-500 line-through text-lg mb-1">
            ${plan.originalPrice}
          </div>
        )}
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-bold text-yellow-400">${plan.price}</span>
          {plan.price > 0 && <span className="text-gray-400">/{plan.period}</span>}
          {plan.price === 0 && <span className="text-gray-400">{plan.period}</span>}
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            {feature.included ? (
              <Check size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <X size={20} className="text-gray-600 flex-shrink-0 mt-0.5" />
            )}
            <span className={feature.included ? 'text-gray-300' : 'text-gray-600'}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <button
        onClick={onSelect}
        className={`w-full bg-gradient-to-r ${colors.button} text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group`}
      >
        {plan.cta}
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>

    </div>
  );
}

function FAQItem({ question, answer }) {
  return (
    <div className="glass p-4 rounded-xl">
      <h4 className="font-semibold text-yellow-400 mb-2">{question}</h4>
      <p className="text-gray-400">{answer}</p>
    </div>
  );
}

export default PricingPage;
