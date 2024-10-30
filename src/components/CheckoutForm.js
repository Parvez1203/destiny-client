import React, { useEffect, useState } from 'react';
import { useStripe, useElements, PaymentRequestButtonElement, CardElement } from '@stripe/react-stripe-js';

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
        // displayItems: [
        //   { label: "Product 1", amount: 1000 },
        //   { label: "Product 2", amount: 1000 },
        // ],
      });

      // Add shipping options
      pr.on("shippingaddresschange", (event) => {
        const shippingOptions = [
          { id: "free-shipping", label: "Free Shipping", detail: "5-7 days", amount: 0 },
          { id: "express-shipping", label: "Express Shipping", detail: "2-3 days", amount: 500 },
        ];

        event.updateWith({ status: "success", shippingOptions });
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
              paymentMethodType: e.paymentMethod.id,
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);

    const { clientSecret } = await fetch('https://destiny-server-nhyk.onrender.com/create-product-and-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethodType: 'card',
        shipping: {
          recipient: 'Customer',  // Replace with actual data if you collect it
          addressLine: ['123 Main St'],
          city: 'Anytown',
          region: 'CA',
          postalCode: '12345',
          countryCode: 'US'
        },
        email: 'customer@example.com',
        product: {
          name: 'botanical soda variety (18 pack)',
          qty: '1',
          description: 'The best drink for fall Halloween, Thanksgiving, and Fall will never be the same.',
          price: 20,
          currency: 'USD'
        }
      }),
    }).then(r => r.json());

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: 'Customer Name', // Replace with actual data if you collect it
          email: 'customer@example.com', // Replace with actual data if you collect it
        },
      },
    });

    if (error) {
      console.error("Payment error:", error);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      console.log("Payment successful!");
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      {paymentRequestAvailable ? (
        <PaymentRequestButtonElement options={{ paymentRequest }} />
      ) : (
        <form onSubmit={handleSubmit}>
          <CardElement />
          <button type="submit" disabled={!stripe}>
            Pay with Card
          </button>
        </form>
      )}
    </div>
  );
}

export default CheckoutForm;
