import React, { useEffect, useState } from 'react';
import { useStripe, useElements, PaymentRequestButtonElement } from '@stripe/react-stripe-js';

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [paymentRequestAvailable, setPaymentRequestAvailable] = useState(false);

  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: 'Sample Product',
          amount: 1000, // Amount in cents ($10.00)
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      pr.on('token', async (e) => {
        const { clientSecret } = await fetch('https://destiny-server-nhyk.onrender.com/create-product-and-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentMethodType: 'card',
            amount: 1000,
            currency: 'usd',
            name: 'Sample Product',
            description: 'Description here',
          }),
        }).then(r => r.json());

        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret, 
          { payment_method: e.paymentMethod.id }, 
          { handleActions: false }
        );

        if (error) {
          e.complete('fail');
        } else {
          e.complete('success');
          if (paymentIntent.status === 'requires_action') {
            await stripe.confirmCardPayment(clientSecret);
          }
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
    <div>
      {paymentRequestAvailable ? (
        <PaymentRequestButtonElement options={{ paymentRequest }} />
      ) : (
        <p>Apple Pay is not available on this device.</p>
      )}
    </div>
  );
}

export default CheckoutForm;
