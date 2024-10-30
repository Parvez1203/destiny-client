import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement, PaymentRequestButtonElement } from '@stripe/react-stripe-js';

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [productDetails, setProductDetails] = useState({
    name: 'Product Name', // Replace with your actual product name
    description: 'Product Description', // Replace with your product description
    amount: 2000, // Amount in cents
  });

  // Initialize the payment request
  const paymentRequest = stripe?.paymentRequest({
    country: 'US',
    currency: 'usd',
    total: {
      label: productDetails.name,
      amount: productDetails.amount,
    },
    requestPayerName: true,
    requestPayerEmail: true,
    requestShipping: true, // Request shipping information
  });

  // Handle payment request updates
  paymentRequest?.on('paymentmethod', async (event) => {
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/completion`,
      },
    });

    if (error) {
      setMessage(error.message);
      event.complete('fail');
    } else {
      setMessage('Payment succeeded!');
      event.complete('success');
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/completion`,
      },
    });

    if (error.type === 'card_error' || error.type === 'validation_error') {
      setMessage(error.message);
    } else {
      setMessage('An unexpected error occurred.');
    }

    setIsProcessing(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      {/* Render the Payment Request Button Element */}
      {paymentRequest && (
        <PaymentRequestButtonElement options={{ paymentRequest }} />
      )}
      {/* Render the Payment Element for other payment methods */}
      <PaymentElement id="payment-element" />
      <button disabled={isProcessing || !stripe || !elements} id="submit">
        <span id="button-text">
          {isProcessing ? 'Processing ... ' : 'Pay now'}
        </span>
      </button>
      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
}
