import React from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import PricingPage from './PricingPage';

export default function AccessGuard({ requiredFeature, children }) {
  const { canAccessFeature, subscription, loading } = useSubscription();
  const [showPricing, setShowPricing] = React.useState(false);

  if (loading) return null;  // or optional spinner

  const hasAccess = canAccessFeature(requiredFeature);

  if (hasAccess) return children;

  // Fallback UI for free users
  return (
    <div className="relative flex flex-col items-center justify-center p-6 text-center">
      <p className="text-white/80 mb-4">
        This feature requires the ACE Plan or Lifetime Access.
      </p>
      <button
        onClick={() => setShowPricing(true)}
        className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded text-white font-semibold"
      >
        Upgrade Now
      </button>

      {showPricing && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <PricingPage onClose={() => setShowPricing(false)} />
        </div>
      )}
    </div>
  );
}
