import React, { useEffect, useState } from 'react';
import { PaymentRequestButtonElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentRequest, setPaymentRequest] = useState(null);

  useEffect(() => {
    if (stripe) {
      const request = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: 'Total',
          amount: 2000, // amount in cents
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      // Check if the Payment Request is supported
      request.canMakePayment().then((result) => {
        if (result) {
          setPaymentRequest(request);
        } else {
          console.error('Payment Request not supported');
        }
      });

      request.on('token', async (event) => {
        // Send the token to your server for processing
        const { token } = event;
        // Example API call
        await fetch('https://destiny-server-nhyk.onrender.com/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: token.id }),
        });
        
        // Complete the payment
        event.complete('success');
      });
    }
  }, [stripe]);

  return (
    <div>
      {paymentRequest && (
        <PaymentRequestButtonElement options={{ paymentRequest }} />
      )}
    </div>
  );
};

export default CheckoutForm;
