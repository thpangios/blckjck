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

  //──────────────────────────────────────────────
  // Utility: Determine if two dates fall on the same day
  const isSameDay = (date) => {
    if (!date) return false;
    const d = new Date(date);
    const t = new Date();
    return (
      d.getFullYear() === t.getFullYear() &&
      d.getMonth() === t.getMonth() &&
      d.getDate() === t.getDate()
    );
  };

  //──────────────────────────────────────────────
  // Load user profile from Supabase "users" table
  const loadUserProfile = async () => {
    if (!user) return null;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;

      setUserProfile(data);

      // compute today's used rounds once profile loaded
      const playedToday = isSameDay(data.last_training_completed_at);
      setTrainingRoundsUsed(playedToday ? data.total_training_rounds || 0 : 0);

      return data;
    } catch (err) {
      console.error("Error loading user profile:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  //──────────────────────────────────────────────
  // Increment training rounds and update Supabase "users" table
  const incrementTrainingRounds = async (game) => {
    if (!user || !userProfile) return false;

    const planType = userProfile.plan_type || "free";
    if (planType !== "free") return true; // premium = unlimited

    const playedToday = isSameDay(userProfile.last_training_completed_at);
    const rounds = playedToday ? trainingRoundsUsed : 0;

    if (rounds >= 5) return false;

    const newCount = rounds + 1;
    const now = new Date().toISOString();

    try {
      await supabase
        .from("users")
        .update({
          total_training_rounds: newCount,
          last_training_completed_at: now,
        })
        .eq("id", user.id);

      setTrainingRoundsUsed(newCount);
      setUserProfile({
        ...userProfile,
        total_training_rounds: newCount,
        last_training_completed_at: now,
      });

      return true;
    } catch (err) {
      console.error("Error incrementing training rounds:", err);
      return false;
    }
  };

  //──────────────────────────────────────────────
  // Live profile listener (plan upgrades, usage updates)
  useEffect(() => {
    if (user) {
      loadUserProfile();

      const channel = supabase
        .channel("user-profile-updates")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "users", filter: `id=eq.${user.id}` },
          (payload) => {
            if (payload.new) {
              setUserProfile(payload.new);

              const playedToday = isSameDay(payload.new.last_training_completed_at);
              const rounds = playedToday ? payload.new.total_training_rounds || 0 : 0;
              setTrainingRoundsUsed(rounds);
            }
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

  //──────────────────────────────────────────────
  // Derived plan metadata
  const planType = userProfile?.plan_type || "free";
  const planStatus = userProfile?.plan_status || "active";

  // Premium checks
  const isPremium = useMemo(() => {
    return (
      userProfile &&
      (planType === "ace" || planType === "ace_pro") &&
      planStatus === "active"
    );
  }, [userProfile, planType, planStatus]);

  const isAcePro = useMemo(() => {
    return (
      userProfile &&
      planType === "ace_pro" &&
      planStatus === "active"
    );
  }, [userProfile, planType, planStatus]);

  //──────────────────────────────────────────────
  // Training limit logic (client-side daily reset)
  const canPlayTraining = () => {
    if (planType !== "free") return true;
    const playedToday = isSameDay(userProfile?.last_training_completed_at);
    const rounds = playedToday ? trainingRoundsUsed : 0;
    return rounds < 5;
  };

  const remainingTrainingRounds = useMemo(() => {
    if (planType === "free") {
      const playedToday = isSameDay(userProfile?.last_training_completed_at);
      const rounds = playedToday ? trainingRoundsUsed : 0;
      return Math.max(0, 5 - rounds);
    }
    return "Unlimited";
  }, [planType, userProfile, trainingRoundsUsed]);

  //──────────────────────────────────────────────
  // Feature Access Checks
  const canAccessAICoach = () => planType === "ace" || planType === "ace_pro";
  const canAccessHandAnalyzer = () => planType === "ace_pro";
  const canAccessCardCounting = () => planType === "ace" || planType === "ace_pro";
  const canAccessAdvancedAnalytics = () => planType === "ace" || planType === "ace_pro";

  const canAccessFeature = (feature) => {
    switch (feature) {
      case "ai_coach": return canAccessAICoach();
      case "hand_analyzer": return canAccessHandAnalyzer();
      case "card_counting": return canAccessCardCounting();
      case "advanced_analytics":
      case "unlimited_rounds":
      case "pattern_recognition":
        return canAccessAdvancedAnalytics();
      default:
        return true;
    }
  };

  //──────────────────────────────────────────────
  // Refresh helper
  const refreshSubscription = async () => {
    if (user) await loadUserProfile();
  };

  //──────────────────────────────────────────────
  // Context value
  const value = {
    subscription: userProfile,
    userProfile,
    loading,
    trainingRoundsUsed,

    isPremium,
    isAcePro,
    planType,

    canPlayTraining,
    remainingTrainingRounds,
    incrementTrainingRounds,
    refreshSubscription,

    canAccessFeature,
    canAccessAICoach,
    canAccessHandAnalyzer,
    canAccessCardCounting,
    canAccessAdvancedAnalytics,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
