import React, { useEffect, useState } from 'react';
import { useStripe, useElements, PaymentRequestButtonElement } from '@stripe/react-stripe-js';

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [paymentRequestAvailable, setPaymentRequestAvailable] = useState(false);

  useEffect(() => {
    if (stripe) {
      // Set up payment request
      const pr = stripe.paymentRequest({
        country: "US",
        currency: "usd",
        total: {
          label: "Total",
          amount: 2000, // Amount in cents
        },
        requestPayerName: true,
        requestPayerEmail: true,
        requestPayerPhone: true,
        requestShipping: true,
        displayItems: [
          { label: "Product 1", amount: 1000 },
          { label: "Product 2", amount: 1000 },
        ],
      });

      pr.on('token', async (e) => {
        try {
          // Fetch client secret from your backend
          const { clientSecret } = await fetch('https://destiny-server-nhyk.onrender.com/create-product-and-checkout-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentMethodType: 'card',
              shipping: e.shippingAddress,
              email: e.payerEmail,
              product: {
                name: 'botanical soda variety (18 pack)',
                qty: '1',
                description: 'The best drink for fall Halloween, Thanksgiving, and Fall will never be the same.',
                price: 20,
                currency: 'USD'
              }
            }),
          }).then(r => r.json());
      
          // Confirm payment with the retrieved client secret
          const { error, paymentIntent } = await stripe.confirmCardPayment(
            clientSecret,
            { payment_method: e.paymentMethod.id }
          );
      
          if (error) {
            console.error("Payment error:", error);
            e.complete('fail'); // Notify failure to the payment request
          } else {
            e.complete('success'); // Complete the payment request process
      
            // If additional actions are required (e.g., 3D Secure)
            if (paymentIntent.status === 'requires_action') {
              await stripe.confirmCardPayment(clientSecret);
            }
      
            // Check if payment is successful
            if (paymentIntent.status === 'succeeded') {
              console.log("Payment successful!");
            }
          }
        } catch (error) {
          console.error("Error processing payment:", error);
          e.complete('fail'); // Ensure fail is sent if an error occurs
        }
      });
      

      pr.canMakePayment().then((result) => {
        if (result) {
          setPaymentRequest(pr);
          setPaymentRequestAvailable(true);
        } else {
          setPaymentRequestAvailable(false);
        }
      });
    }
  }, [stripe]);

  return (
    <div style={{
margin:'20px'    // Rounded corners for a nice look
}}>
      {paymentRequestAvailable ? (
        <PaymentRequestButtonElement options={{ paymentRequest }} />
      ) : (
        <p>Apple Pay is not available on this device.</p>
      )}
    </div>
  );
}

export default CheckoutForm;
