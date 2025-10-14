import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

export async function handleStripeCheckout(productId) {
  const response = await fetch(
    'https://rdrbedgxihxavpplfigm.supabase.co/functions/v1/create-checkout-session',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add Supabase user auth here if your edge function requires it
      },
      body: JSON.stringify({ product_id: productId })
    }
  );
  const data = await response.json();
  const { sessionId, url } = data;

  // If you get a sessionId, use Stripe.js redirection
  if(sessionId){
    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId });
  } 
  // If the edge function returns a direct url, fallback to that
  else if(url) {
    window.location = url;
  } 
  else {
    alert('Checkout failed to initialize.');
  }
}
