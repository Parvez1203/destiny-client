import { useEffect, useState } from "react";
import { Elements, PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { loadStripe } from "@stripe/stripe-js";

function Payment() {
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [isPaymentRequestSupported, setIsPaymentRequestSupported] = useState(false);

  useEffect(() => {
    // Load the Stripe object with the publishable key
    fetch("https://destiny-server-nhyk.onrender.com/config").then(async (r) => {
      const { publishableKey } = await r.json();
      setStripePromise(loadStripe(publishableKey));
    });
  }, []);

  useEffect(() => {
    // Fetch clientSecret for Payment Element
    fetch("https://destiny-server-nhyk.onrender.com/create-payment-intent", {
      method: "POST",
      body: JSON.stringify({}),
    }).then(async (result) => {
      const { clientSecret } = await result.json();
      setClientSecret(clientSecret);
    });
  }, []);

  useEffect(() => {
    // Set up the Payment Request object if Stripe has loaded
    if (stripePromise) {
      stripePromise.then((stripe) => {
        if (!stripe) return;
        const pr = stripe.paymentRequest({
          country: "US", // Replace with your country
          currency: "usd",
          total: {
            label: "Total",
            amount: 1000, // Replace with your total amount
          },
          requestPayerName: true,
          requestPayerEmail: true,
        });

        // Check if the Payment Request API is supported
        pr.canMakePayment().then((result) => {
          if (result) {
            setIsPaymentRequestSupported(true);
            setPaymentRequest(pr);
          }
        });
      });
    }
    console.log(paymentRequest);
    
  }, [stripePromise]);

  return (
    <>
      <h1>React Stripe and the Payment Element</h1>
      
      {isPaymentRequestSupported && paymentRequest && (
        <PaymentRequestButtonElement options={{ paymentRequest }} />
      )}
      
      {clientSecret && stripePromise && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm />
        </Elements>
      )}
    </>
  );
}

export default Payment;
