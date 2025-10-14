import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

/**
 * Initiates Stripe Checkout for a given product.
 * @param {string} productId - Stripe Product ID (e.g. 'prod_xxx')
 */
export async function handleStripeCheckout(productId) {
  try {
    const response = await fetch(
      'https://rdrbedgxihxavpplfigm.supabase.co/functions/v1/create-checkout-session',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Optional: include auth if your function checks user identity
          // 'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ product_id: productId }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! ${response.status}`);
    }

    const data = await response.json();

    if (data.sessionId) {
      // Stripe session → redirect
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });
      if (error) throw error;
    } else if (data.url) {
      // Fallback to direct URL redirect
      window.location = data.url;
    } else {
      throw new Error('No sessionId or URL returned from server.');
    }
  } catch (err) {
    console.error('Stripe Checkout error:', err);
    alert('Failed to start checkout. Please try again later.');
  }
}
