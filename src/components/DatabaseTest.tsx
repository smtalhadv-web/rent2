import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface TestResult {
  status: 'loading' | 'success' | 'error';
  message: string;
  data?: any;
}

export function DatabaseTest() {
  const [results, setResults] = useState<TestResult[]>([]);

  useEffect(() => {
    const runTests = async () => {
      const testResults: TestResult[] = [];

      // Test 0: Check environment variables
      console.log('[v0] Environment variables:', {
        url: import.meta.env.VITE_SUPABASE_URL,
        keyExists: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      });

      // Test 1: Check Supabase connection
      console.log('[v0] Starting database connection tests...');
      try {
        const { data, error, count } = await supabase
          .from('tenants')
          .select('*', { count: 'exact' });
        
        if (error) {
          console.error('[v0] Query error:', error);
          throw error;
        }
        
        testResults.push({
          status: 'success',
          message: `✓ Supabase connection successful - Found ${count || 0} tenants`,
          data: data?.slice(0, 2),
        });
        console.log('[v0] Connection test passed. Count:', count);
      } catch (error: any) {
        testResults.push({
          status: 'error',
          message: `✗ Connection failed: ${error.message || 'Unknown error'}`,
        });
        console.log('[v0] Connection test failed:', error);
      }

      // Test 2: Read tenants table
      try {
        const { data: tenants, error, count } = await supabase
          .from('tenants')
          .select('*', { count: 'exact' });
        
        if (error) throw error;
        
        testResults.push({
          status: 'success',
          message: `✓ Read tenants table: ${count} records found`,
          data: tenants?.slice(0, 2),
        });
        console.log('[v0] Read tenants:', count, 'records');
      } catch (error: any) {
        testResults.push({
          status: 'error',
          message: `✗ Failed to read tenants: ${error.message}`,
        });
        console.log('[v0] Read tenants failed:', error);
      }

      // Test 3: Read leases table
      try {
        const { data: leases, error, count } = await supabase
          .from('leases')
          .select('*', { count: 'exact' });
        
        if (error) throw error;
        
        testResults.push({
          status: 'success',
          message: `✓ Read leases table: ${count} records found`,
          data: leases?.slice(0, 2),
        });
        console.log('[v0] Read leases:', count, 'records');
      } catch (error: any) {
        testResults.push({
          status: 'error',
          message: `✗ Failed to read leases: ${error.message}`,
        });
        console.log('[v0] Read leases failed:', error);
      }

      // Test 4: Read payments table
      try {
        const { data: payments, error, count } = await supabase
          .from('payments')
          .select('*', { count: 'exact' });
        
        if (error) throw error;
        
        testResults.push({
          status: 'success',
          message: `✓ Read payments table: ${count} records found`,
          data: payments?.slice(0, 2),
        });
        console.log('[v0] Read payments:', count, 'records');
      } catch (error: any) {
        testResults.push({
          status: 'error',
          message: `✗ Failed to read payments: ${error.message}`,
        });
        console.log('[v0] Read payments failed:', error);
      }

      // Test 5: Read rent records table
      try {
        const { data: rentRecords, error, count } = await supabase
          .from('rent_records')
          .select('*', { count: 'exact' });
        
        if (error) throw error;
        
        testResults.push({
          status: 'success',
          message: `✓ Read rent_records table: ${count} records found`,
          data: rentRecords?.slice(0, 2),
        });
        console.log('[v0] Read rent_records:', count, 'records');
      } catch (error: any) {
        testResults.push({
          status: 'error',
          message: `✗ Failed to read rent_records: ${error.message}`,
        });
        console.log('[v0] Read rent_records failed:', error);
      }

      // Test 6: Read settings table
      try {
        const { data: settings, error } = await supabase
          .from('settings')
          .select('*')
          .single();
        
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
        
        testResults.push({
          status: 'success',
          message: `✓ Read settings table: ${settings ? 'Found' : 'Empty'}`,
          data: settings,
        });
        console.log('[v0] Read settings:', settings);
      } catch (error: any) {
        testResults.push({
          status: 'error',
          message: `✗ Failed to read settings: ${error.message}`,
        });
        console.log('[v0] Read settings failed:', error);
      }

      // Test 7: Test write operation (insert a test record)
      try {
        const testId = `test-${Date.now()}`;
        const { data: inserted, error } = await supabase
          .from('tenants')
          .insert([
            {
              id: testId,
              name: 'Test Tenant',
              premises: 'Test Unit',
              status: 'active',
              monthly_rent: 50000,
            },
          ])
          .select();
        
        if (error) throw error;
        
        testResults.push({
          status: 'success',
          message: '✓ Write operation successful: Test record inserted',
          data: inserted?.[0],
        });
        console.log('[v0] Write test passed');

        // Test 8: Delete test record
        try {
          const { error: deleteError } = await supabase
            .from('tenants')
            .delete()
            .eq('id', testId);
          
          if (deleteError) throw deleteError;
          
          testResults.push({
            status: 'success',
            message: '✓ Delete operation successful: Test record removed',
          });
          console.log('[v0] Delete test passed');
        } catch (error: any) {
          testResults.push({
            status: 'error',
            message: `✗ Failed to delete test record: ${error.message}`,
          });
          console.log('[v0] Delete test failed:', error);
        }
      } catch (error: any) {
        testResults.push({
          status: 'error',
          message: `✗ Failed to insert test record: ${error.message}`,
        });
        console.log('[v0] Write test failed:', error);
      }

      setResults(testResults);
      console.log('[v0] All tests completed');
    };

    runTests();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Database Connection Tests</h2>
      
      <div className="space-y-3">
        {results.length === 0 ? (
          <p className="text-gray-500">Running tests...</p>
        ) : (
          results.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded border-l-4 ${
                result.status === 'success'
                  ? 'bg-green-50 border-green-500'
                  : 'bg-red-50 border-red-500'
              }`}
            >
              <p
                className={
                  result.status === 'success'
                    ? 'text-green-800 font-semibold'
                    : 'text-red-800 font-semibold'
                }
              >
                {result.message}
              </p>
              {result.data && (
                <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
