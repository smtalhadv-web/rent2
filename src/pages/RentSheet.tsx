// Importing necessary modules
import React from 'react';

const RentSheet = ({ tenants }) => {
  return (
    <div>
      <h1>Rent Sheet</h1>
      <table>
        <thead>
          <tr>
            <th>Tenant</th>
            <th>Monthly Rent</th>
            <th>Outstanding Rent</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant, index) => (
            <tr key={index}>
              <td>{tenant.name}</td>
              <td>{tenant.monthlyRent}</td>
              <td>{tenant.outstandingRent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RentSheet;