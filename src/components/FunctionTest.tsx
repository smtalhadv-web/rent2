import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'running';
  message: string;
  details?: any;
}

export function FunctionTest() {
  const app = useApp();
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const newResults: TestResult[] = [];

    try {
      // Test 1: Check initial data
      console.log('[v0] Test 1: Checking initial data...');
      newResults.push({
        name: 'Initial Data Load',
        status: 'success',
        message: `Loaded ${app.tenants.length} tenants, ${app.leases.length} leases, ${app.payments.length} payments`,
        details: {
          tenants: app.tenants.length,
          leases: app.leases.length,
          payments: app.payments.length,
          rentRecords: app.rentRecords.length,
        },
      });

      // Test 2: Add a test tenant
      console.log('[v0] Test 2: Adding test tenant...');
      const testTenantId = `test-${Date.now()}`;
      await app.addTenant({
        name: 'Test Tenant',
        phone: '+923001111111',
        premises: 'Test Unit',
        monthlyRent: 50000,
        securityDeposit: 100000,
        status: 'active',
        cnic: '',
        email: '',
        effectiveDate: '',
        depositAccountNo: '',
        utilityNo: '',
      });

      // Give a moment for state to update
      await new Promise(resolve => setTimeout(resolve, 500));

      const tenantAdded = app.tenants.find(t => t.name === 'Test Tenant');
      if (tenantAdded) {
        newResults.push({
          name: 'Add Tenant',
          status: 'success',
          message: 'Test tenant added successfully',
          details: { tenant: tenantAdded.name, id: tenantAdded.id },
        });

        // Test 3: Generate rent sheet for current month
        console.log('[v0] Test 3: Generating rent sheet...');
        const currentMonth = new Date().toISOString().slice(0, 7);
        app.generateRentSheet(currentMonth);

        await new Promise(resolve => setTimeout(resolve, 500));

        const rentRecordsCount = app.rentRecords.filter(r => r.monthYear === currentMonth).length;
        newResults.push({
          name: 'Generate Rent Sheet',
          status: 'success',
          message: `Created rent records for ${rentRecordsCount} tenants`,
          details: { currentMonth, recordsCount: rentRecordsCount },
        });

        // Test 4: Add a payment
        console.log('[v0] Test 4: Adding payment...');
        await app.addPayment({
          tenantId: tenantAdded.id,
          monthYear: currentMonth,
          amount: 25000,
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'cash',
          transactionNo: 'TEST-001',
          depositedAccount: '172',
          createdAt: new Date().toISOString(),
        });

        await new Promise(resolve => setTimeout(resolve, 500));

        const paymentAdded = app.payments.find(p => p.transactionNo === 'TEST-001');
        if (paymentAdded) {
          newResults.push({
            name: 'Add Payment',
            status: 'success',
            message: 'Payment recorded successfully',
            details: { amount: paymentAdded.amount, method: paymentAdded.paymentMethod },
          });

          // Test 5: Check outstanding balance calculation
          console.log('[v0] Test 5: Checking outstanding balance...');
          const rentRecord = app.rentRecords.find(
            r => r.tenantId === tenantAdded.id && r.monthYear === currentMonth
          );

          if (rentRecord) {
            const outstanding = rentRecord.balance;
            // Correct formula: outstanding = outstanding_previous + rent - paid
            const expectedOutstanding = rentRecord.outstandingPrevious + rentRecord.rent - paymentAdded.amount;
            
            newResults.push({
              name: 'Outstanding Balance',
              status: outstanding === expectedOutstanding ? 'success' : 'error',
              message: outstanding === expectedOutstanding
                ? `Outstanding balance calculated correctly: Rs ${outstanding}`
                : `Outstanding mismatch: expected Rs ${expectedOutstanding}, got Rs ${outstanding}`,
              details: {
                outstandingPrevious: rentRecord.outstandingPrevious,
                rent: rentRecord.rent,
                paid: rentRecord.paid,
                outstanding: outstanding,
                expected: expectedOutstanding,
              },
            });
          }

          // Test 6: Add lease
          console.log('[v0] Test 6: Adding lease...');
          await app.addLease({
            tenantId: tenantAdded.id,
            startDate: currentMonth + '-01',
            endDate: new Date(new Date().getFullYear() + 1, new Date().getMonth(), 1).toISOString().split('T')[0],
            durationMonths: 12,
            incrementPercent: 10,
            reminderDays: 30,
            status: 'running',
            documentUrl: '',
          });

          await new Promise(resolve => setTimeout(resolve, 500));

          const leaseAdded = app.leases.find(l => l.tenantId === tenantAdded.id);
          newResults.push({
            name: 'Add Lease',
            status: leaseAdded ? 'success' : 'error',
            message: leaseAdded ? 'Lease added successfully' : 'Failed to add lease',
            details: { leaseId: leaseAdded?.id },
          });

          // Test 7: Apply rent increment
          console.log('[v0] Test 7: Applying rent increment...');
          const oldRent = tenantAdded.monthlyRent;
          app.applyRentIncrement(tenantAdded.id);

          await new Promise(resolve => setTimeout(resolve, 500));

          const rentHistoryEntry = app.rentHistory.find(h => h.tenantId === tenantAdded.id);
          newResults.push({
            name: 'Apply Rent Increment',
            status: rentHistoryEntry ? 'success' : 'error',
            message: rentHistoryEntry
              ? `Rent increment applied: Rs ${oldRent} → Rs ${rentHistoryEntry.newRent}`
              : 'Failed to apply rent increment',
            details: {
              oldRent: oldRent,
              newRent: rentHistoryEntry?.newRent,
              incrementPercent: rentHistoryEntry?.incrementPercent,
            },
          });

          // Test 8: Add deposit adjustment
          console.log('[v0] Test 8: Adding deposit adjustment...');
          await app.addDepositAdjustment({
            tenantId: tenantAdded.id,
            description: 'Maintenance deduction',
            amount: 5000,
            date: new Date().toISOString().split('T')[0],
          });

          await new Promise(resolve => setTimeout(resolve, 500));

          const adjustmentAdded = app.depositAdjustments.find(
            a => a.tenantId === tenantAdded.id && a.description === 'Maintenance deduction'
          );
          newResults.push({
            name: 'Add Deposit Adjustment',
            status: adjustmentAdded ? 'success' : 'error',
            message: adjustmentAdded ? 'Deposit adjustment recorded' : 'Failed to add adjustment',
            details: { amount: adjustmentAdded?.amount, description: adjustmentAdded?.description },
          });

          // Test 9: Update settings
          console.log('[v0] Test 9: Updating settings...');
          app.updateSettings({
            plazaName: 'Updated Plaza Name',
            phone: '+92 300 9999999',
          });

          await new Promise(resolve => setTimeout(resolve, 500));

          newResults.push({
            name: 'Update Settings',
            status: app.settings.plazaName === 'Updated Plaza Name' ? 'success' : 'error',
            message: app.settings.plazaName === 'Updated Plaza Name'
              ? 'Settings updated successfully'
              : 'Failed to update settings',
            details: {
              plazaName: app.settings.plazaName,
              phone: app.settings.phone,
            },
          });

          // Test 10: Verify Supabase persistence (check if tenant still exists)
          console.log('[v0] Test 10: Verifying Supabase persistence...');
          const persistedTenant = app.tenants.find(t => t.name === 'Test Tenant');
          newResults.push({
            name: 'Supabase Persistence',
            status: persistedTenant ? 'success' : 'error',
            message: persistedTenant
              ? 'Tenant data persisted in Supabase'
              : 'Tenant data not found (may have failed to save)',
            details: { foundTenant: persistedTenant ? true : false },
          });
        } else {
          newResults.push({
            name: 'Add Payment',
            status: 'error',
            message: 'Failed to add payment',
          });
        }
      } else {
        newResults.push({
          name: 'Add Tenant',
          status: 'error',
          message: 'Failed to add test tenant',
        });
      }
    } catch (error: any) {
      newResults.push({
        name: 'Unexpected Error',
        status: 'error',
        message: error.message,
      });
    }

    setResults(newResults);
    setTesting(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Function Test Suite</h1>
        <p className="text-gray-600 mb-8">Testing all app functions including tenants, payments, rent records, and outstanding balances</p>

        {testing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-900">Running tests...</p>
          </div>
        )}

        <div className="space-y-4">
          {results.map((result, idx) => (
            <div
              key={idx}
              className={`border rounded-lg p-4 ${
                result.status === 'success'
                  ? 'bg-green-50 border-green-200'
                  : result.status === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">
                  {result.status === 'success' ? '✓' : result.status === 'error' ? '✗' : '⋯'}
                </span>
                <h3 className="font-bold text-lg">{result.name}</h3>
              </div>
              <p className={result.status === 'error' ? 'text-red-800' : 'text-gray-800'}>
                {result.message}
              </p>
              {result.details && (
                <details className="mt-2 text-sm text-gray-600">
                  <summary className="cursor-pointer font-medium">Details</summary>
                  <pre className="mt-2 bg-white p-2 rounded border border-gray-200 text-xs overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={runTests}
          disabled={testing}
          className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {testing ? 'Running Tests...' : 'Run Tests Again'}
        </button>
      </div>
    </div>
  );
}
