import React from 'react';

export const Invoice = ({ monthlyRent, paymentDate }: { monthlyRent?: number; paymentDate?: string }) => {
    return (
        <div>
            <h1>Invoice</h1>
            <p>Monthly Rent: {monthlyRent}</p>
            <p>Payment Date: {paymentDate}</p>
        </div>
    );
};


