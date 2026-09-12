import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

/**
 * Handles external redirects via the homepage (/) so static hosts without
 * SPA rewrites still load the app before client-side routing kicks in.
 */
const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const action = searchParams.get('action');
    const token = searchParams.get('token');

    if (action === 'reset-password' && token) {
      navigate(`/reset-password/${token}`, { replace: true });
      return;
    }

    const payment = searchParams.get('payment');
    if (!payment) return;

    const orderId = searchParams.get('orderId');
    const sessionId = searchParams.get('session_id');

    if (payment === 'success' && orderId && sessionId) {
      navigate(`/orders/${orderId}?payment=success&session_id=${sessionId}`, { replace: true });
    } else if (payment === 'cancelled') {
      navigate('/checkout?payment=cancelled', { replace: true });
    }
  }, [searchParams, navigate]);

  return null;
};

export default PaymentReturn;
