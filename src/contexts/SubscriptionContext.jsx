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
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trainingRoundsUsed, setTrainingRoundsUsed] = useState(0);

  // ── Fetch subscription from Supabase
  const loadSubscription = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        await createFreeSubscription();
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error("Error loading subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  // ── Create initial free subscription
  const createFreeSubscription = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .insert([{ user_id: user.id, plan_type: "free", status: "active" }])
        .select()
        .single();

      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error("Error creating free subscription:", error);
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
      loadSubscription();
      loadTrainingRounds();

      const channel = supabase
        .channel("subscription-updates")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "subscriptions",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.new) setSubscription(payload.new);
          }
        )
        .subscribe();

      return () => {
        if (channel) supabase.removeChannel(channel);
      };
    } else {
      setSubscription(null);
      setTrainingRoundsUsed(0);
      setLoading(false);
    }
  }, [user]);

  // ── Access helpers
  const premium = useMemo(() => {
    return (
      subscription &&
      (subscription.plan_type === "ace" || subscription.plan_type === "lifetime") &&
      subscription.status === "active"
    );
  }, [subscription]);

  const canPlayTraining = () => (premium ? true : trainingRoundsUsed < 5);
  const remainingTrainingRounds = premium ? "Unlimited" : Math.max(0, 5 - trainingRoundsUsed);

  const premiumFeatures = [
    "ai_coach",
    "card_counting",
    "advanced_analytics",
    "unlimited_rounds",
    "pattern_recognition",
  ];

  const canAccessFeature = (feature) => {
    if (premiumFeatures.includes(feature)) return premium;
    return true;
  };

  const refreshSubscription = async () => {
    if (user) await loadSubscription();
  };

  const value = {
    subscription,
    loading,
    trainingRoundsUsed,
    isPremium: premium,
    canPlayTraining,
    remainingTrainingRounds,
    incrementTrainingRounds,
    refreshSubscription,
    canAccessFeature,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}
