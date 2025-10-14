import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const SubscriptionContext = createContext();

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return context;
}

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailyRoundsUsed, setDailyRoundsUsed] = useState(0);

  // ───────────────────────────────
  // STEP 1 — Load subscription + daily rounds on mount or login change
  // ───────────────────────────────
  useEffect(() => {
    if (user) {
      loadSubscription();
      loadDailyRounds();

      // 🔁 live listener — auto‑update when webhook changes table
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
            console.log("🔔 Subscription updated:", payload.new);
            if (payload.new) setSubscription(payload.new);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setSubscription(null);
      setDailyRoundsUsed(0);
      setLoading(false);
    }
  }, [user]);

  // ───────────────────────────────
  // STEP 2 — Fetch subscription from Supabase
  // ───────────────────────────────
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
        // if user has no record — create a free plan row
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

  // ───────────────────────────────
  // STEP 3 — Create initial free subscription row
  // ───────────────────────────────
  const createFreeSubscription = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .insert([
          {
            user_id: user.id,
            plan_type: "free",
            status: "active",
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error("Error creating free subscription:", error);
    }
  };

  // ───────────────────────────────
  // STEP 4 — Handle daily usage limit for free users
  // ───────────────────────────────
  const loadDailyRounds = () => {
    if (!user) return;
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`daily_rounds_${user.id}`);

    if (stored) {
      const { date, count } = JSON.parse(stored);
      if (date === today) {
        setDailyRoundsUsed(count);
      } else {
        setDailyRoundsUsed(0);
        localStorage.setItem(
          `daily_rounds_${user.id}`,
          JSON.stringify({ date: today, count: 0 })
        );
      }
    } else {
      localStorage.setItem(
        `daily_rounds_${user.id}`,
        JSON.stringify({ date: today, count: 0 })
      );
    }
  };

  const incrementDailyRounds = () => {
    if (!user) return;
    const today = new Date().toDateString();
    const newCount = dailyRoundsUsed + 1;

    setDailyRoundsUsed(newCount);
    localStorage.setItem(
      `daily_rounds_${user.id}`,
      JSON.stringify({ date: today, count: newCount })
    );
  };

  // ───────────────────────────────
  // STEP 5 — Helpers for access control
  // ───────────────────────────────
  const isPremium = () => {
    if (!subscription) return false;
    return (
      (subscription.plan_type === "ace" ||
        subscription.plan_type === "lifetime") &&
      subscription.status === "active"
    );
  };

  const hasRoundsRemaining = () => {
    if (isPremium()) return true; // premium = no limits
    return dailyRoundsUsed < 5;
  };

  const getRemainingRounds = () => {
    if (isPremium()) return "Unlimited";
    return Math.max(0, 5 - dailyRoundsUsed);
  };

  const premiumFeatures = [
    "ai_coach",
    "card_counting",
    "advanced_analytics",
    "unlimited_rounds",
    "pattern_recognition",
  ];

  const canAccessFeature = (feature) => {
    if (premiumFeatures.includes(feature)) {
      return isPremium();
    }
    return true;
  };

  // ───────────────────────────────
  // STEP 6 — Manual refresh trigger (used on success page)
  // ───────────────────────────────
  const refreshSubscription = async () => {
    if (user) {
      await loadSubscription();
    }
  };

  // ───────────────────────────────
  // STEP 7 — Export context value
  // ───────────────────────────────
  const value = {
    subscription,
    loading,
    dailyRoundsUsed,
    isPremium: isPremium(),
    hasRoundsRemaining: hasRoundsRemaining(),
    remainingRounds: getRemainingRounds(),
    incrementDailyRounds,
    refreshSubscription,
    canAccessFeature,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
