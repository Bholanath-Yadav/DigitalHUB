import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://sfxlrflxhetwmgcnovij.supabase.co/";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmeGxyZmx4aGV0d21nY25vdmlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzgwMjk3NCwiZXhwIjoyMDkzMzc4OTc0fQ._w8yDIas9eUcov5IbMC0PwDwWrmBTKFWOCIKCtP2JPk";

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase credentials not found. Check your .env files");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSQL(sql) {
  try {
    const { error } = await supabase.rpc("exec", { sql });
    if (error) throw error;
    return true;
  } catch (err) {
    // If exec function doesn't exist, try direct query
    const { error } = await supabase.from("_internal").select().limit(1);
    if (error?.code === "PGRST116") {
      console.log("⚠️  Using fallback method...");
      return false;
    }
    throw err;
  }
}

async function setupDatabase() {
  try {
    console.log("🔧 Setting up Supabase database...\n");

    const schemaPath = path.join("lib", "db", "sql", "schema.sql");
    const seedPath = path.join("lib", "db", "sql", "seed.sql");

    if (!fs.existsSync(schemaPath)) {
      console.error(`❌ Schema file not found: ${schemaPath}`);
      process.exit(1);
    }
    if (!fs.existsSync(seedPath)) {
      console.error(`❌ Seed file not found: ${seedPath}`);
      process.exit(1);
    }

    const schema = fs.readFileSync(schemaPath, "utf8");
    const seed = fs.readFileSync(seedPath, "utf8");

    console.log("✏️  Running schema...");
    const { error: schemaError } = await supabase.rpc("exec", { sql: schema }).catch(() => ({
      error: new Error(
        "⚠️  Could not use exec RPC. Please run the SQL manually in Supabase dashboard.\n\nGo to SQL Editor and copy-paste the contents of:\n1. lib/db/sql/schema.sql\n2. lib/db/sql/seed.sql"
      ),
    }));

    if (schemaError) {
      console.log("\n" + schemaError.message);
      console.log("\n📋 Manual Instructions:");
      console.log("1. Go to: https://app.supabase.com");
      console.log("2. Select your project");
      console.log("3. Click 'SQL Editor' → 'New Query'");
      console.log("4. Copy contents from: lib/db/sql/schema.sql and paste it");
      console.log("5. Click 'Run'");
      console.log("6. Repeat steps 3-5 with: lib/db/sql/seed.sql");
      return;
    }

    console.log("✅ Schema created successfully!");

    console.log("\n✏️  Running seed data...");
    const { error: seedError } = await supabase.rpc("exec", { sql: seed });

    if (seedError) {
      console.error("❌ Seed error:", seedError);
      return;
    }

    console.log("✅ Seed data inserted successfully!");
    console.log("\n📊 Database populated with:");
    console.log("  • 10 Products (games, gift cards, subscriptions)");
    console.log("  • 3 Banners");
    console.log("  • 4 Payment Methods");
    console.log("  • 3 Coupon Codes");
  } catch (error) {
    console.error("\n⚠️  Could not auto-run SQL queries.");
    console.log("\nManual Setup Instructions:");
    console.log("1. Go to: https://app.supabase.com");
    console.log("2. Select your project 'DigitalHUB'");
    console.log("3. Click 'SQL Editor' in the left sidebar");
    console.log("4. Click 'New Query'");
    console.log("5. Copy ALL contents from: lib/db/sql/schema.sql");
    console.log("6. Paste and click 'Run'");
    console.log("7. Create another new query");
    console.log("8. Copy ALL contents from: lib/db/sql/seed.sql");
    console.log("9. Paste and click 'Run'");
    console.log("\nDone! Your database will be fully populated.");
  }
}

setupDatabase();
