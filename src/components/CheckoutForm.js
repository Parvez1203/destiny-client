import React, { useEffect, useState } from 'react';
import { PaymentRequestButtonElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

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
        requestShipping: true, // Request shipping details
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
        const { token, shipping } = event; // Get shipping details

        try {
          // Send the token and shipping details to your server for processing
          const response = await fetch('https://destiny-server-nhyk.onrender.com/create-payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: token.id, shipping }),
          });

          const data = await response.json();

          if (response.ok) {
            // Payment succeeded
            setMessage('Payment successful! Thank you for your purchase.');
            setSuccess(true);
          } else {
            // Payment failed
            setMessage(data.error || 'Payment failed. Please try again.');
            setSuccess(false);
          }
        } catch (error) {
          console.error(error);
          setMessage('An error occurred. Please try again later.');
          setSuccess(false);
        }

        // Complete the payment
        event.complete(success ? 'success' : 'fail');
      });

      // Handle shipping address updates
      request.on('shippingaddresschange', (event) => {
        // Update total amount or handle shipping address change logic if necessary
        event.updateWith({ status: 'success' }); // Always mark as success for this example
      });
    }
  }, [stripe]);

  return (
    <div>
      {paymentRequest && <PaymentRequestButtonElement options={{ paymentRequest }} />}
      {message && (
        <div style={{ marginTop: '20px', color: success ? 'green' : 'red' }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default CheckoutForm;
