const supabaseUrl = 'https://sfxlrflxhetwmgcnovij.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmeGxyZmx4aGV0d21nY25vdmlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgwMjk3NCwiZXhwIjoyMDkzMzc4OTc0fQ._w8yDIas9eUcov5IbMC0PwDwWrmBTKFWOCIKCtP2JPk';
const headers = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
};

const tables = ['users', 'products', 'orders', 'payments', 'coupons', 'banners', 'chat_messages', 'payment_settings'];

for (const table of tables) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=1`, {
    headers: {
      ...headers,
      Prefer: 'count=exact',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    console.log(`${table}: ERROR - ${response.status} ${response.statusText} ${body}`);
    continue;
  }

  const contentRange = response.headers.get('content-range') ?? '';
  const totalMatch = contentRange.match(/\/(\d+)$/);
  const total = totalMatch ? totalMatch[1] : 'unknown';
  console.log(`${table}: ${total}`);
}

const productsResponse = await fetch(`${supabaseUrl}/rest/v1/products?select=id,name&limit=3`, { headers });
if (productsResponse.ok) {
  const products = await productsResponse.json();
  console.log(`sample products: ${products.map((product) => product.name).join(', ')}`);
}

const couponsResponse = await fetch(`${supabaseUrl}/rest/v1/coupons?select=code&limit=3`, { headers });
if (couponsResponse.ok) {
  const coupons = await couponsResponse.json();
  console.log(`sample coupons: ${coupons.map((coupon) => coupon.code).join(', ')}`);
}
