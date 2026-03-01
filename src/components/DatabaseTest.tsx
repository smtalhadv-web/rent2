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
      const supabaseUrl = (import.meta.env as any).NEXT_PUBLIC_SUPABASE_URL || 
                          import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = (import.meta.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                          import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      console.log('[v0] Environment check:');
      console.log('[v0] NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl?.substring(0, 30) + '...');
      console.log('[v0] NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!supabaseKey);
      console.log('[v0] All env keys:', Object.keys(import.meta.env).filter(k => k.includes('SUPABASE')));

      testResults.push({
        status: supabaseUrl && supabaseKey ? 'success' : 'error',
        message: supabaseUrl && supabaseKey 
          ? `✓ Environment variables configured (${supabaseUrl.substring(0, 20)}...)` 
          : `✗ Missing environment variables`,
      });

      // Test 1: Test direct API call using fetch (bypasses schema cache)
      console.log('[v0] Testing direct REST API call...');
      const restUrl = `${supabaseUrl}/rest/v1/tenants?select=*&limit=5`;
      console.log('[v0] REST API URL:', restUrl);
      console.log('[v0] API Key length:', supabaseKey?.length);
      
      try {
        const response = await fetch(restUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
            'Content-Type': 'application/json',
          },
        });

        console.log('[v0] REST API Response status:', response.status);
        console.log('[v0] REST API Response headers:', {
          'content-type': response.headers.get('content-type'),
          'content-length': response.headers.get('content-length'),
        });

        const responseText = await response.text();
        console.log('[v0] REST API Response (first 300 chars):', responseText.substring(0, 300));

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${responseText}`);
        }

        const data = JSON.parse(responseText);
        testResults.push({
          status: 'success',
          message: `✓ Direct REST API successful - Found ${data.length} tenants`,
          data: data?.slice(0, 2),
        });
        console.log('[v0] Direct API test passed. Data count:', data.length);
      } catch (error: any) {
        testResults.push({
          status: 'error',
          message: `✗ Direct REST API failed: ${error.message}`,
        });
        console.log('[v0] Direct API test failed:', error);
      }

      // Test 2: Check Supabase connection with client
      console.log('[v0] Testing Supabase client connection...');
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
          message: `✓ Supabase client connection successful - Found ${count || 0} tenants`,
          data: data?.slice(0, 2),
        });
        console.log('[v0] Client connection test passed. Count:', count);
      } catch (error: any) {
        testResults.push({
          status: 'error',
          message: `✗ Supabase client connection failed: ${error.message || 'Unknown error'}`,
        });
        console.log('[v0] Client connection test failed:', error);
      }

      // Test 4: Test write operation (insert a test record)
      try {
        // Generate a proper UUID format
        const generateUUID = () => {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
        };
        
        const testId = generateUUID();
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

        // Test 5: Delete test record
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
