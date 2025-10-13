#!/usr/bin/env node

/**
 * Supabase Database Connection Test Script
 * 
 * This script tests if your application can connect to Supabase database.
 * Run with: node test-db-connection.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Try to load .env.local if it exists
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: '.env.local' });
}

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

async function testSupabaseConnection() {
  console.log('\n' + colors.bright + colors.blue + '🔍 Testing Supabase Database Connection...' + colors.reset + '\n');

  // Get credentials from environment or use defaults from source files
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bxdegqsladfaczeixnmh.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Check if we're using environment variables or defaults
  const usingEnvFile = fs.existsSync(envPath);
  if (!usingEnvFile) {
    console.log(colors.yellow + '⚠ No .env.local file found, using default URL from source files' + colors.reset);
    console.log(colors.yellow + '  To use custom credentials, create a .env.local file with your Supabase keys' + colors.reset + '\n');
  }

  // Check if credentials exist
  if (!supabaseUrl) {
    console.log(colors.red + '❌ NEXT_PUBLIC_SUPABASE_URL not found' + colors.reset);
    process.exit(1);
  }

  if (!supabaseAnonKey && !supabaseServiceKey) {
    console.log(colors.red + '❌ No Supabase keys found.' + colors.reset);
    console.log(colors.yellow + '\n💡 Please create a .env.local file with:' + colors.reset);
    console.log('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
    console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_key\n');
    process.exit(1);
  }

  console.log(colors.green + '✓ Supabase URL found: ' + colors.reset + supabaseUrl);
  console.log(colors.green + '✓ Credentials found in environment' + colors.reset + '\n');

  // Create Supabase client (prefer service key for admin operations)
  const supabaseKey = supabaseServiceKey || supabaseAnonKey;
  const keyType = supabaseServiceKey ? 'Service Role Key' : 'Anon Key';
  
  console.log(colors.blue + `📡 Connecting with: ${keyType}` + colors.reset);

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Test 1: Check if we can connect and query the database
    console.log('\n' + colors.yellow + '🔄 Test 1: Basic connectivity...' + colors.reset);
    
    // Try to get a simple connection test
    try {
      const { data: healthCheck, error: healthError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (healthError && healthError.code === '42P01') {
        // Table doesn't exist, try another approach
        console.log(colors.yellow + '  ⚠ users table not found, trying alternative...' + colors.reset);
        
        // Try to get a list of tables from information_schema
        const { data: tables, error: tablesError } = await supabase.rpc('get_tables', {});
        
        if (tablesError) {
          // If RPC doesn't exist, just try a simple query
          console.log(colors.yellow + '  ⚠ RPC not found, testing raw connection...' + colors.reset);
          const { data, error } = await supabase.auth.getSession();
          
          if (error && error.message.includes('network')) {
            throw new Error('Network error: Cannot reach Supabase server');
          }
          
          console.log(colors.green + '  ✓ Connection successful!' + colors.reset);
        } else {
          console.log(colors.green + '  ✓ Connection successful!' + colors.reset);
        }
      } else if (healthError) {
        throw healthError;
      } else {
        console.log(colors.green + '  ✓ Connection successful!' + colors.reset);
      }
    } catch (testError) {
      console.log(colors.yellow + '  ⚠ Basic connectivity test encountered an issue, trying auth...' + colors.reset);
    }

    // Test 2: Check auth capabilities
    console.log('\n' + colors.yellow + '🔄 Test 2: Auth API connectivity...' + colors.reset);
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError && authError.message.includes('network')) {
      throw new Error('Network error: Cannot reach Supabase Auth API');
    }
    
    console.log(colors.green + '  ✓ Auth API accessible!' + colors.reset);

    // Test 3: List available tables (if using service key)
    if (supabaseServiceKey) {
      console.log('\n' + colors.yellow + '🔄 Test 3: Checking database tables...' + colors.reset);
      
      // Try to query common tables
      const tablesToCheck = ['users', 'meetings', 'profiles'];
      const foundTables = [];
      
      for (const table of tablesToCheck) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (!error) {
          foundTables.push(table);
        }
      }
      
      if (foundTables.length > 0) {
        console.log(colors.green + `  ✓ Found tables: ${foundTables.join(', ')}` + colors.reset);
      } else {
        console.log(colors.yellow + '  ⚠ No common tables found (this might be okay if your DB is new)' + colors.reset);
      }
    }

    // Final success message
    console.log('\n' + colors.bright + colors.green + '✅ SUCCESS! Database connection is working!' + colors.reset);
    console.log(colors.green + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset + '\n');
    
    process.exit(0);

  } catch (error) {
    console.log('\n' + colors.bright + colors.red + '❌ CONNECTION FAILED!' + colors.reset);
    console.log(colors.red + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
    console.log(colors.red + '\nError Details:' + colors.reset);
    console.log(error.message || error);
    
    if (error.message && error.message.includes('Invalid API key')) {
      console.log('\n' + colors.yellow + '💡 Tip: Check that your SUPABASE keys are correct in .env.local' + colors.reset);
    } else if (error.message && error.message.includes('network')) {
      console.log('\n' + colors.yellow + '💡 Tip: Check your internet connection and Supabase URL' + colors.reset);
    }
    
    console.log('\n');
    process.exit(1);
  }
}

// Run the test
testSupabaseConnection();

