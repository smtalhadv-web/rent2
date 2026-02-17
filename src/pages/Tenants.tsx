import React from 'react';

interface Tenant {
    id: number;
    name: string;
    monthlyRent: number;
}

const Tenants: React.FC = () => {
    const tenants: Tenant[] = [
        { id: 1, name: 'John Doe', monthlyRent: 1200 },
        { id: 2, name: 'Jane Smith', monthlyRent: 1500 }
    ];

    return (
        <div>
            <h1>Tenants</h1>
            <ul>
                {tenants.map(tenant => (
                    <li key={tenant.id}> {tenant.name} - ${tenant.monthlyRent} </li>
                ))}
            </ul>
        </div>
    );
};

export default Tenants;