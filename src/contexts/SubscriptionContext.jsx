import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext();

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailyRoundsUsed, setDailyRoundsUsed] = useState(0);

  useEffect(() => {
    if (user) {
      loadSubscription();
      loadDailyRounds();
    } else {
      setSubscription(null);
      setDailyRoundsUsed(0);
      setLoading(false);
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        await createFreeSubscription();
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFreeSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([
          {
            user_id: user.id,
            plan_type: 'free',
            status: 'active'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Error creating free subscription:', error);
    }
  };

  const loadDailyRounds = () => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`daily_rounds_${user.id}`);

    if (stored) {
      const { date, count } = JSON.parse(stored);
      if (date === today) {
        setDailyRoundsUsed(count);
      } else {
        setDailyRoundsUsed(0);
        localStorage.setItem(`daily_rounds_${user.id}`, JSON.stringify({ date: today, count: 0 }));
      }
    } else {
      localStorage.setItem(`daily_rounds_${user.id}`, JSON.stringify({ date: today, count: 0 }));
    }
  };

  const incrementDailyRounds = () => {
    if (!user) return;

    const today = new Date().toDateString();
    const newCount = dailyRoundsUsed + 1;

    setDailyRoundsUsed(newCount);
    localStorage.setItem(`daily_rounds_${user.id}`, JSON.stringify({ date: today, count: newCount }));
  };

  const refreshSubscription = async () => {
    if (user) {
      await loadSubscription();
    }
  };

  const isPremium = () => {
    if (!subscription) return false;
    return (subscription.plan_type === 'ace' || subscription.plan_type === 'lifetime') &&
           subscription.status === 'active';
  };

  const hasRoundsRemaining = () => {
    if (isPremium()) return true;
    return dailyRoundsUsed < 5;
  };

  const getRemainingRounds = () => {
    if (isPremium()) return 'Unlimited';
    return Math.max(0, 5 - dailyRoundsUsed);
  };

  const canAccessFeature = (feature) => {
    const premiumFeatures = [
      'ai_coach',
      'card_counting',
      'advanced_analytics',
      'unlimited_rounds',
      'pattern_recognition'
    ];

    if (premiumFeatures.includes(feature)) {
      return isPremium();
    }

    return true;
  };

  const value = {
    subscription,
    loading,
    dailyRoundsUsed,
    isPremium: isPremium(),
    hasRoundsRemaining: hasRoundsRemaining(),
    remainingRounds: getRemainingRounds(),
    incrementDailyRounds,
    refreshSubscription,
    canAccessFeature
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
