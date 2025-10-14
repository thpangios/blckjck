// src/utils/stripeCheckout.js
import { loadStripe } from '@stripe/stripe-js';

// Public publishable key (VITE_STRIPE_KEY = pk_live_xxx or pk_test_xxx)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

/**
 * Initiates Stripe Checkout for a given plan/price.
 * @param {string} priceId - Stripe Price ID (e.g., 'price_xxx')
 */
export async function handleStripeCheckout(priceId) {
  try {
    const response = await fetch(
      'https://rdrbedgxihxavpplfigm.supabase.co/functions/v1/create-checkout-session',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Optional: include auth header if you use Supabase Auth
          // 'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ price_id: priceId }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();

    if (data.sessionId) {
      // Preferred Stripe redirect via sessionId
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });
      if (error) throw error;
    } else if (data.url) {
      // Fallback (if server returned direct URL)
      window.location.href = data.url;
    } else {
      throw new Error('No sessionId or URL returned from server.');
    }
  } catch (err) {
    console.error('Stripe Checkout error:', err);
    alert('Failed to start checkout. Please try again later.');
  }
}
