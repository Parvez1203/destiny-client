import React, { useState, useEffect } from 'react';
import { PaymentRequestButtonElement, useStripe } from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: 'Demo total',
          amount: 1099,
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });

      pr.canMakePayment().then(result => {
        if (result) {
          setPaymentRequest(pr);

          // Add the event listener once we know `pr` is supported
          pr.on('paymentmethod', async (ev) => {
            console.log(clientSecret);
            const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
              clientSecret,
              { payment_method: ev.paymentMethod.id },
              { handleActions: false }
            );

            if (confirmError) {
              ev.complete('fail');
            } else {
              ev.complete('success');
              if (paymentIntent.status === "requires_action") {
                const { error } = await stripe.confirmCardPayment(clientSecret);
                if (error) {
                  // Handle error
                } else {
                  // Payment succeeded
                }
              } else {
                // Payment succeeded
              }
            }
          });
        }
      });
    }
  }, [stripe, clientSecret]);

  useEffect(() => {
    fetch("https://destiny-server-nhyk.onrender.com/create-payment-intent", {
      method: "POST",
      body: JSON.stringify({}),
    }).then(async (result) => {
      const { clientSecret } = await result.json();
      setClientSecret(clientSecret);
    });
  }, []);

  if (paymentRequest) {
    return <PaymentRequestButtonElement options={{ paymentRequest }} />;
  }

  return 'Insert your form or button component here.';
};

export default CheckoutForm;
