import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { categoryApi, menuItemApi, userApi, orderApi } from '../../lib/api';
import './TestConnection.css';

const TestConnection = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    const testResults = {};

    try {
      // Test 1: Check Supabase connection
      console.log('Testing Supabase connection...');
      const { data: session } = await supabase.auth.getSession();
      testResults.auth = {
        status: session.session ? '✅ Authenticated' : '❌ Not authenticated',
        email: session.session?.user?.email || 'N/A',
        role: session.session?.user?.user_metadata?.role || 'N/A'
      };

      // Test 2: Test categories
      try {
        console.log('Testing categories...');
        const categories = await categoryApi.getCategories();
        testResults.categories = {
          status: '✅ Success',
          count: categories.length,
          data: categories
        };
      } catch (error) {
        testResults.categories = {
          status: '❌ Failed',
          error: error.message,
          details: error
        };
      }

      // Test 3: Test menu items
      try {
        console.log('Testing menu items...');
        const menuItems = await menuItemApi.getMenuItems();
        testResults.menuItems = {
          status: '✅ Success',
          count: menuItems.length,
          data: menuItems
        };
      } catch (error) {
        testResults.menuItems = {
          status: '❌ Failed',
          error: error.message,
          details: error
        };
      }

      // Test 4: Test users
      try {
        console.log('Testing users...');
        const users = await userApi.getUsers();
        testResults.users = {
          status: '✅ Success',
          count: users.length,
          data: users
        };
      } catch (error) {
        testResults.users = {
          status: '❌ Failed',
          error: error.message,
          details: error
        };
      }

      // Test 5: Test orders
      try {
        console.log('Testing orders...');
        const orders = await orderApi.getOrders();
        testResults.orders = {
          status: '✅ Success',
          count: orders.length,
          data: orders
        };
      } catch (error) {
        testResults.orders = {
          status: '❌ Failed',
          error: error.message,
          details: error
        };
      }

      // Test 6: Direct Supabase query
      try {
        console.log('Testing direct query...');
        const { data, error } = await supabase
          .from('categories')
          .select('*');
        
        if (error) throw error;
        
        testResults.directQuery = {
          status: '✅ Success',
          count: data.length,
          data: data
        };
      } catch (error) {
        testResults.directQuery = {
          status: '❌ Failed',
          error: error.message,
          details: error
        };
      }

    } catch (error) {
      console.error('Test failed:', error);
    }

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className='test-connection'>
      <h1>Database Connection Test</h1>
      <p>Click the button below to test all database connections and RLS policies</p>
      
      <button onClick={testConnection} disabled={loading} className='test-btn'>
        {loading ? 'Testing...' : 'Run Connection Test'}
      </button>

      {Object.keys(results).length > 0 && (
        <div className='test-results'>
          <h2>Test Results:</h2>
          
          {/* Authentication */}
          {results.auth && (
            <div className='result-card'>
              <h3>🔐 Authentication</h3>
              <p><strong>Status:</strong> {results.auth.status}</p>
              <p><strong>Email:</strong> {results.auth.email}</p>
              <p><strong>Role:</strong> {results.auth.role}</p>
            </div>
          )}

          {/* Categories */}
          {results.categories && (
            <div className='result-card'>
              <h3>📁 Categories</h3>
              <p><strong>Status:</strong> {results.categories.status}</p>
              {results.categories.count !== undefined && (
                <p><strong>Count:</strong> {results.categories.count}</p>
              )}
              {results.categories.error && (
                <div className='error-details'>
                  <p><strong>Error:</strong> {results.categories.error}</p>
                  <pre>{JSON.stringify(results.categories.details, null, 2)}</pre>
                </div>
              )}
            </div>
          )}

          {/* Menu Items */}
          {results.menuItems && (
            <div className='result-card'>
              <h3>🍽️ Menu Items</h3>
              <p><strong>Status:</strong> {results.menuItems.status}</p>
              {results.menuItems.count !== undefined && (
                <p><strong>Count:</strong> {results.menuItems.count}</p>
              )}
              {results.menuItems.error && (
                <div className='error-details'>
                  <p><strong>Error:</strong> {results.menuItems.error}</p>
                  <pre>{JSON.stringify(results.menuItems.details, null, 2)}</pre>
                </div>
              )}
            </div>
          )}

          {/* Users */}
          {results.users && (
            <div className='result-card'>
              <h3>👥 Users</h3>
              <p><strong>Status:</strong> {results.users.status}</p>
              {results.users.count !== undefined && (
                <p><strong>Count:</strong> {results.users.count}</p>
              )}
              {results.users.error && (
                <div className='error-details'>
                  <p><strong>Error:</strong> {results.users.error}</p>
                  <pre>{JSON.stringify(results.users.details, null, 2)}</pre>
                </div>
              )}
            </div>
          )}

          {/* Orders */}
          {results.orders && (
            <div className='result-card'>
              <h3>📦 Orders</h3>
              <p><strong>Status:</strong> {results.orders.status}</p>
              {results.orders.count !== undefined && (
                <p><strong>Count:</strong> {results.orders.count}</p>
              )}
              {results.orders.error && (
                <div className='error-details'>
                  <p><strong>Error:</strong> {results.orders.error}</p>
                  <pre>{JSON.stringify(results.orders.details, null, 2)}</pre>
                </div>
              )}
            </div>
          )}

          {/* Direct Query */}
          {results.directQuery && (
            <div className='result-card'>
              <h3>🔍 Direct Query (Categories)</h3>
              <p><strong>Status:</strong> {results.directQuery.status}</p>
              {results.directQuery.count !== undefined && (
                <p><strong>Count:</strong> {results.directQuery.count}</p>
              )}
              {results.directQuery.error && (
                <div className='error-details'>
                  <p><strong>Error:</strong> {results.directQuery.error}</p>
                  <pre>{JSON.stringify(results.directQuery.details, null, 2)}</pre>
                </div>
              )}
            </div>
          )}

          <div className='instructions'>
            <h3>📋 Next Steps:</h3>
            {results.categories?.error || results.menuItems?.error || results.users?.error || results.orders?.error ? (
              <>
                <p>❌ Some tests failed! This is likely an RLS policy issue.</p>
                <ol>
                  <li>Go to your Supabase Dashboard</li>
                  <li>Open SQL Editor</li>
                  <li>Run the SQL from <code>FIX_RLS_POLICIES.sql</code></li>
                  <li>Come back and click "Run Connection Test" again</li>
                </ol>
              </>
            ) : (
              <>
                <p>✅ All tests passed! Your database is working correctly.</p>
                <p>If pages still show empty, try:</p>
                <ol>
                  <li>Logout and login again</li>
                  <li>Clear browser cache (Ctrl+Shift+Delete)</li>
                  <li>Check if data actually exists in Supabase Table Editor</li>
                </ol>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestConnection;
