import React, { useEffect } from "react";
import { useSubscription } from "../contexts/SubscriptionContext";

export default function SuccessPage() {
  const { refreshSubscription } = useSubscription();

  // Runs once when user is redirected back from Stripe Checkout
  useEffect(() => {
    refreshSubscription();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-900 via-gray-900 to-black text-center text-white p-8">
      <h1 className="text-4xl font-bold mb-4 text-yellow-400">Payment Successful!</h1>
      <p className="text-lg text-gray-300 mb-8">
        Welcome to <span className="text-yellow-400 font-semibold">Ace♠️</span> —
        your premium access is now active.
      </p>
      <a
        href="/"
        className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-rose-600 rounded-xl font-semibold hover:opacity-90 transition"
      >
        Go to Dashboard
      </a>
    </div>
  );
}
