import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const SubscriptionContext = createContext();

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error("useSubscription must be used within SubscriptionProvider");
  return context;
}

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trainingRoundsUsed, setTrainingRoundsUsed] = useState(0);

  // ── Fetch user profile from users table (includes plan info)
  const loadUserProfile = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setUserProfile(data);
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // ── Manage daily training usage
  const loadTrainingRounds = () => {
    if (!user) return;
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`daily_training_rounds_${user.id}`);

    if (stored) {
      const { date, count } = JSON.parse(stored);
      if (date === today) {
        setTrainingRoundsUsed(count);
      } else {
        setTrainingRoundsUsed(0);
        localStorage.setItem(
          `daily_training_rounds_${user.id}`,
          JSON.stringify({ date: today, count: 0 })
        );
      }
    } else {
      localStorage.setItem(
        `daily_training_rounds_${user.id}`,
        JSON.stringify({ date: today, count: 0 })
      );
    }
  };

  const incrementTrainingRounds = (isTraining = false) => {
    if (!user || !isTraining) return;
    const today = new Date().toDateString();
    const newCount = trainingRoundsUsed + 1;
    setTrainingRoundsUsed(newCount);
    localStorage.setItem(
      `daily_training_rounds_${user.id}`,
      JSON.stringify({ date: today, count: newCount })
    );
  };

  // ── Realtime listener and initial load
  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadTrainingRounds();

      // Listen for changes to user profile (including plan updates)
      const channel = supabase
        .channel("user-profile-updates")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "users",
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            console.log("User profile updated:", payload);
            if (payload.new) setUserProfile(payload.new);
          }
        )
        .subscribe();

      return () => {
        if (channel) supabase.removeChannel(channel);
      };
    } else {
      setUserProfile(null);
      setTrainingRoundsUsed(0);
      setLoading(false);
    }
  }, [user]);

  // ── Access helpers
const planType = userProfile?.plan_type || 'free';
const planStatus = userProfile?.plan_status || 'active';

// Premium check (Ace or Ace Pro)
const isPremium = useMemo(() => {
  return (
    userProfile &&
    (planType === "ace" || planType === "ace_pro") &&
    planStatus === "active"
  );
}, [userProfile, planType, planStatus]);

// Ace Pro check (highest tier)
const isAcePro = useMemo(() => {
  return (
    userProfile &&
    planType === "ace_pro" &&
    planStatus === "active"
  );
}, [userProfile, planType, planStatus]);

// Training rounds access
const canPlayTraining = () => {
  if (planType === 'free') {
    return trainingRoundsUsed < 5; // Free: 5 rounds per day
  }
  return true; // Ace & Ace Pro: Unlimited
};

const remainingTrainingRounds = useMemo(() => {
  if (planType === 'free') {
    return Math.max(0, 5 - trainingRoundsUsed);
  }
  return "Unlimited";
}, [planType, trainingRoundsUsed]);

// Feature access control
const canAccessAICoach = () => {
  // Free users: NO access
  // Ace users: YES
  // Ace Pro users: YES
  return planType === 'ace' || planType === 'ace_pro';
};

const canAccessHandAnalyzer = () => {
  // Free users: NO
  // Ace users: NO
  // Ace Pro users: YES (exclusive feature!)
  return planType === 'ace_pro';
};

const canAccessCardCounting = () => {
  // Free users: NO
  // Ace users: YES
  // Ace Pro users: YES
  return planType === 'ace' || planType === 'ace_pro';
};

const canAccessAdvancedAnalytics = () => {
  // Free users: NO
  // Ace users: YES
  // Ace Pro users: YES
  return planType === 'ace' || planType === 'ace_pro';
};

// Generic feature check (backward compatibility)
const canAccessFeature = (feature) => {
  switch(feature) {
    case 'ai_coach':
      return canAccessAICoach();
    case 'hand_analyzer':
      return canAccessHandAnalyzer();
    case 'card_counting':
      return canAccessCardCounting();
    case 'advanced_analytics':
    case 'unlimited_rounds':
    case 'pattern_recognition':
      return canAccessAdvancedAnalytics();
    default:
      return true; // Unknown features are accessible by default
  }
};

  const refreshSubscription = async () => {
    if (user) await loadUserProfile();
  };

  const value = {
  subscription: userProfile, // For backward compatibility
  userProfile,
  loading,
  trainingRoundsUsed,
  isPremium,
  isAcePro, // ✅ NEW
  planType, // ✅ NEW
  canPlayTraining,
  remainingTrainingRounds,
  incrementTrainingRounds,
  refreshSubscription,
  canAccessFeature,
  // ✅ NEW specific access functions
  canAccessAICoach,
  canAccessHandAnalyzer,
  canAccessCardCounting,
  canAccessAdvancedAnalytics,
};

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}
