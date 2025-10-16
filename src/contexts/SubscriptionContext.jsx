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
  const isPremium = useMemo(() => {
    return (
      userProfile &&
      (userProfile.plan_type === "ace" || userProfile.plan_type === "lifetime") &&
      userProfile.plan_status === "active"
    );
  }, [userProfile]);

  const canPlayTraining = () => (isPremium ? true : trainingRoundsUsed < 5);
  const remainingTrainingRounds = isPremium ? "Unlimited" : Math.max(0, 5 - trainingRoundsUsed);

  const premiumFeatures = [
    "ai_coach",
    "card_counting",
    "advanced_analytics",
    "unlimited_rounds",
    "pattern_recognition",
  ];

  const canAccessFeature = (feature) => {
    if (premiumFeatures.includes(feature)) return isPremium;
    return true;
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
    canPlayTraining,
    remainingTrainingRounds,
    incrementTrainingRounds,
    refreshSubscription,
    canAccessFeature,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}
