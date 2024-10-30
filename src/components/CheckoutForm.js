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
      
        requestShipping: true,
        // `shippingOptions` is optional at this point:
        shippingOptions: [
          // The first shipping option in this list appears as the default
          // option in the browser payment interface.
          {
            id: 'free-shipping',
            label: 'Free shipping',
            detail: 'Arrives in 5 to 7 days',
            amount: 0,
          },
        ],
      });

      pr.canMakePayment().then(result => {
        if (result) {
          setPaymentRequest(pr);

          // Add the event listener once we know `pr` is supported
          pr.on('paymentmethod', async (ev) => {

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

      pr.on('shippingaddresschange', async (ev) => {
        if (ev.shippingAddress.country !== 'US') {
          ev.updateWith({status: 'invalid_shipping_address'});
        } else {
          // Perform server-side request to fetch shipping options
          const response = await fetch('/calculateShipping', {
            data: JSON.stringify({
              shippingAddress: ev.shippingAddress
            })
          });
          const result = await response.json();
      
          ev.updateWith({
            status: 'success',
            shippingOptions: result.supportedShippingOptions,
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
