// src/utils/stripeCheckout.js
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe using your publishable key from environment variables
// (e.g. VITE_STRIPE_KEY = pk_live_xxx or pk_test_xxx)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

/**
 * Initiates Stripe Checkout for a given price ID.
 * @param {string} priceId - Stripe Price ID (e.g. 'price_xxx')
 */
export async function handleStripeCheckout(priceId) {
  try {
    // Call your Supabase Edge Function to create a Checkout Session
    const response = await fetch(
      'https://rdrbedgxihxavpplfigm.supabase.co/functions/v1/create-checkout-session',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Optional: include auth header if your function checks user identity
          // 'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ price_id: priceId }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();

    // ✅ Modern Stripe.js no longer supports redirectToCheckout()
    // Redirect directly using the session URL returned from your API
    if (data?.url) {
      window.location.href = data.url;
    } else {
      throw new Error('Stripe Checkout: Missing session URL in server response.');
    }
  } catch (err) {
    console.error('Stripe Checkout error:', err);
    alert('Failed to start checkout. Please try again later.');
  }
}
