import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../lib/supabase';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

export async function handleStripeCheckout(priceId, userId) {
  try {
    console.log('🔵 Starting checkout');
    console.log('Price ID:', priceId);
    console.log('User ID:', userId);

    // Validate inputs
    if (!priceId) {
      throw new Error('Price ID is required');
    }

    if (!userId) {
      throw new Error('User ID is required - please log in first');
    }

    // Get the current user's session token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('You must be logged in to upgrade');
    }

    console.log('✅ User authenticated, calling edge function...');

    // Call your Supabase Edge Function to create a Checkout Session
    const response = await fetch(
      'https://rdrbedgxihxavpplfigm.supabase.co/functions/v1/create-checkout-session',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          price_id: priceId,
          user_id: userId
        }),
      }
    );

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Edge function error:', errorData);
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Checkout session created:', data);

    if (data?.url) {
      console.log('🔗 Redirecting to Stripe:', data.url);
      window.location.href = data.url;
    } else {
      throw new Error('Stripe Checkout: Missing session URL in server response.');
    }
  } catch (err) {
    console.error('❌ Stripe Checkout error:', err);
    alert(`Failed to start checkout: ${err.message}`);
  }
}
