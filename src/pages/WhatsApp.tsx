import React from 'react';
import { Tenant } from '../types';

interface WhatsAppProps {
    tenant: Tenant;
}

export const WhatsApp: React.FC<WhatsAppProps> = ({ tenant }) => {
    return (
        <div>
            <h1>Contact Tenant via WhatsApp</h1>
            <p>Monthly Rent: {tenant.monthlyRent}</p>
        </div>
    );
};


