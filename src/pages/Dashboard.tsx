import React from 'react';

const Dashboard = ({ data }) => {
  return (
    <div>
      <h1>Dashboard</h1>
      <div>
        <h2>Monthly Rent: {data.monthlyRent}</h2>
        <h2>Outstanding Payments</h2>
        <ul>
          {data.payments
            .filter(payment => payment.paymentDate.startsWith('2026-'))
            .map(payment => (
              <li key={payment.id}>{payment.monthYear}: {payment.amount}</li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
