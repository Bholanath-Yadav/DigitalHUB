#!/usr/bin/env node

/**
 * Test script to verify admin permissions are set up correctly in Supabase.
 * Run with: node scripts/test-admin-permissions.js
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars
 */

import https from 'https';
import { URL } from 'url';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_UID = 'd02ff351-72b3-45dd-a7ca-474ad82aa48a'; // admin@digitalhub.com

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

function makeRequest(method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(`${SUPABASE_URL}${endpoint}`);
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(urlObj, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null,
            headers: res.headers,
          });
        } catch (e) {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testAdminPermissions() {
  console.log('\n🔍 Testing Admin Permissions in Supabase...\n');

  try {
    // Test 1: Check if admin user exists in public.users
    console.log('1️⃣  Checking if admin user exists in public.users...');
    const userRes = await makeRequest('GET', `/rest/v1/users?supabase_id=eq.${ADMIN_UID}&select=id,supabase_id,email,role`);
    if (userRes.status === 200 && userRes.body && userRes.body.length > 0) {
      const adminUser = userRes.body[0];
      console.log(`✅ Admin user found: ${adminUser.email} (role: ${adminUser.role})`);
      if (adminUser.role !== 'admin') {
        console.warn(`⚠️  Warning: Admin role is '${adminUser.role}', expected 'admin'`);
      }
    } else {
      console.error(`❌ Admin user NOT found. Create one first with: npm run upsert-admin`);
    }

    // Test 2: Check if RLS is enabled on products table
    console.log('\n2️⃣  Checking if RLS is enabled on products table...');
    const productsRes = await makeRequest('GET', `/rest/v1/products?limit=1`);
    if (productsRes.status === 200) {
      console.log(`✅ Products table is accessible`);
    } else if (productsRes.status === 403) {
      console.log(`⚠️  RLS is enabled on products table (expected for authenticated requests without policy)`);
    } else {
      console.log(`⚠️  Products table status: ${productsRes.status}`);
    }

    // Test 3: Check if policies exist
    console.log('\n3️⃣  Checking if RLS policies are defined...');
    const policiesRes = await makeRequest('GET', `/rest/v1/pg_policies?table_name=eq.products`);
    if (policiesRes.status === 200 && Array.isArray(policiesRes.body)) {
      console.log(`✅ Found ${policiesRes.body.length} policies on products table`);
      policiesRes.body.forEach((policy) => {
        console.log(`   - ${policy.policyname || 'unnamed'}`);
      });
    } else {
      console.log(`⚠️  Could not retrieve policies (status: ${policiesRes.status})`);
    }

    // Test 4: Verify migration 009 markers
    console.log('\n4️⃣  Checking migration history...');
    const migrationsRes = await makeRequest('GET', `/rest/v1/migrations?order=version.desc&limit=5`);
    if (migrationsRes.status === 200 && Array.isArray(migrationsRes.body)) {
      console.log(`✅ Found migrations table. Latest 5:`, migrationsRes.body.map(m => m.version || m.name).join(', '));
    } else if (migrationsRes.status === 404) {
      console.log(`⚠️  Migrations table not found`);
    }

    console.log('\n💡 Summary:');
    console.log('   - If admin user is missing: Run npm run upsert-admin');
    console.log('   - If policies are missing: Run migration 009 in Supabase SQL Editor');
    console.log('   - Migration 009 path: lib/db/migrations/009_fix_action_policies.sql');

  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
}

testAdminPermissions();
