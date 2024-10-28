import React from 'react';
import 'dotenv/config'

function CheckoutForm() {
  const handleCheckout = async () => {
    const response = await fetch('https://54.162.201.2:8000/create-product-and-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: "Sample Product",
        description: "This is a sample product description.",
        amount: 10, // Amount in USD ($10.00)
      }),
    });

    if (!response.ok) {
      console.error("Failed to create checkout session");
      return;
    }

    const { sessionId } = await response.json();
    console.log(sessionId);
    
    // Redirect to Stripe Checkout
    const stripe = window.Stripe(process.env.STRIPE_PUBLIC_KEY); // Replace with your actual publishable key
    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      console.error("Error redirecting to checkout:", error);
    }
  };

  return (
    <button onClick={handleCheckout}>Pay Now</button>
  );
}

export default CheckoutForm;
