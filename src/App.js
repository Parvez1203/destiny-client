import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import CheckoutForm from './components/CheckoutForm';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_test_51QBRpFICvmtDwewB0gmIXj01IEfYCvQYUEenHW2tb8fRfKdKwmREn33Xf4ElmKaBGZuNxDwNROk8LONdXAZVxEvY00PDuF8jgW');

export default function App() {
  return (
    <CheckoutForm />
  );
};