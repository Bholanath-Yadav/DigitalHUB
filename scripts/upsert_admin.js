const [,, supabaseUrl, serviceRoleKey, supabaseId, email, role='admin'] = process.argv;
if (!supabaseUrl || !serviceRoleKey || !supabaseId || !email) {
  console.error('Usage: node upsert_admin.js <supabaseUrl> <serviceRoleKey> <supabaseId> <email> [role]');
  process.exit(1);
}

const url = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/users?on_conflict=supabase_id`;
const body = { supabase_id: supabaseId, email, role };

(async () => {
  try {
    let res = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(body)
    });

    if (res.status === 409) {
      // already exists -> PATCH the existing row
      const patchUrl = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/users?supabase_id=eq.${supabaseId}`;
      res = await fetch(patchUrl, {
        method: 'PATCH',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ role: role, email })
      });
    }

    const text = await res.text();
    console.log('status', res.status);
    try { console.log(JSON.stringify(JSON.parse(text), null, 2)); } catch { console.log(text); }
  } catch (err) {
    console.error('error', err);
    process.exit(1);
  }
})();
