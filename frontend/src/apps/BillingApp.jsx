// src/apps/BillingApp.jsx
import { Routes, Route } from 'react-router-dom';
import BillList from '../billing/bills/BillList';
import BillItemsList from '../billing/bill-items/BillItemsList';
import BillPDFView from '../billing/bills/BillPDFView';
import MakePayment from '../billing/bills/MakePayment';
import PaymentList from '../billing/bills/PaymentList';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// ⚡ Replace with your real publishable key (NOT secret key!)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function BillingApp() {
  return (
    <Routes>
      <Route path="/bills" element={<BillList />} />  
      <Route path="/bill-items" element={<BillItemsList />} />
      <Route path="/bills/:billNumber/pdf" element={<BillPDFView />} />  
      
      {/* ✅ Wrap payment route in <Elements> */}
      <Route 
        path="/bills/:billId/pay" 
        element={
          <Elements stripe={stripePromise}>
            <MakePayment />
          </Elements>
        } 
      />
      <Route path="/payments" element={<PaymentList />} />
    </Routes>
  );
}
