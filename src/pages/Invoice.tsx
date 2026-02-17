import React from 'react';

const Invoice = ({ monthlyRent, paymentDate }) => {
    return (
        <div>
            <h1>Invoice</h1>
            <p>Monthly Rent: {monthlyRent}</p>
            <p>Payment Date: {paymentDate}</p>
        </div>
    );
};

export default Invoice;