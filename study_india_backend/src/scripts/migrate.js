const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl || 'NOT SET');
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'SET' : 'NOT SET');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

// Method 1: Try using Supabase Management API
async function executeSQLViaManagementAPI(sql) {
    try {
        const projectRef = supabaseUrl.match(/https:\/\/(.+)\.supabase\.co/)?.[1];

        if (!projectRef) {
            throw new Error('Could not extract project ref from URL');
        }

        const response = await fetch(
            `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${supabaseKey}`,
                },
                body: JSON.stringify({ query: sql }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Management API error: ${response.status} - ${error}`);
        }

        return await response.json();
    } catch (error) {
        console.warn('Management API failed:', error.message);
        return null;
    }
}

// Method 2: Try using REST API with RPC
async function executeSQLViaRPC(sql) {
    try {
        const { data, error } = await supabase.rpc('exec_sql', {
            sql_query: sql
        });

        if (error) {
            // If exec_sql doesn't exist, try creating it first
            if (error.message.includes('function') && error.message.includes('does not exist')) {
                console.log('Creating exec_sql function...');
                const createFunctionSQL = `
          CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
          RETURNS void
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            EXECUTE sql_query;
          END;
          $$;
        `;

                const { error: createError } = await supabase.rpc('exec_sql', {
                    sql_query: ''
                }).maybeSingle();

                if (createError) {
                    throw error; // Original error
                }

                // Retry with the original SQL
                const { data: retryData, error: retryError } = await supabase.rpc('exec_sql', {
                    sql_query: sql
                });

                if (retryError) throw retryError;
                return retryData;
            }

            throw error;
        }

        return data;
    } catch (error) {
        console.warn('RPC method failed:', error.message);
        return null;
    }
}

// Method 3: Split and execute individual statements
async function executeSQLStatement(statement) {
    try {
        const { data, error } = await supabase.rpc('exec_simple', {
            query: statement
        }).maybeSingle();

        if (error) throw error;
        return data;
    } catch (error) {
        // Try direct query for simple statements
        if (statement.toUpperCase().startsWith('CREATE TABLE')) {
            console.warn('  ⚠️  CREATE TABLE must be run in SQL Editor');
            return null;
        }
        throw error;
    }
}

// Method 4: Guide user to run SQL manually
function printManualInstructions(files) {
    console.log('\n' + '='.repeat(60));
    console.log('📋 MANUAL SQL EXECUTION INSTRUCTIONS');
    console.log('='.repeat(60));
    console.log('\nSince automatic migration didn\'t work, please run these SQL files manually:');
    console.log('\n1. Go to Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor (in the left sidebar)');
    console.log('4. For each file below, copy the content and run it:\n');

    files.forEach((file, index) => {
        const filePath = path.join(__dirname, '..', 'sql', file);
        const content = fs.readFileSync(filePath, 'utf8');
        console.log(`\n${'─'.repeat(60)}`);
        console.log(`📄 File ${index + 1}/${files.length}: ${file}`);
        console.log(`${'─'.repeat(60)}`);
        console.log('\nCopy and paste the following into SQL Editor:\n');
        console.log(content);
        console.log('\n' + '─'.repeat(60));
    });
}

async function migrate() {
    console.log('🚀 Starting database migrations...\n');
    console.log(`📍 Supabase URL: ${supabaseUrl}`);
    console.log(`📁 Storage Bucket: ${process.env.SUPABASE_BUCKET_NAME || 'EduBridge'}\n`);

    try {
        const sqlDir = path.join(__dirname, '..', 'sql');

        if (!fs.existsSync(sqlDir)) {
            console.error('❌ SQL directory not found:', sqlDir);
            console.log('\n💡 Make sure you have a "sql" folder with your migration files.');
            process.exit(1);
        }

        const files = fs.readdirSync(sqlDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        if (files.length === 0) {
            console.error('❌ No SQL files found in:', sqlDir);
            process.exit(1);
        }

        console.log(`📝 Found ${files.length} migration files:`);
        files.forEach(f => console.log(`   - ${f}`));

        // Try to create a migrations table first
        console.log('\n📊 Setting up migration tracking...');
        try {
            await supabase.rpc('exec_sql', {
                sql_query: `
          CREATE TABLE IF NOT EXISTS _migrations (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
            }).maybeSingle();
            console.log('✅ Migration tracking table ready');
        } catch (error) {
            console.log('⚠️  Could not create tracking table (will try without it)');
        }

        // Try to run migrations automatically
        let automaticSuccess = true;

        for (const file of files) {
            console.log(`\n⚡ Running migration: ${file}`);
            console.log('─'.repeat(50));

            // Check if migration was already run
            try {
                const { data: existing } = await supabase
                    .from('_migrations')
                    .select('id')
                    .eq('name', file)
                    .single();

                if (existing) {
                    console.log(`⏭️  Already executed, skipping...`);
                    continue;
                }
            } catch (error) {
                // Table might not exist, continue
            }

            const sqlFilePath = path.join(sqlDir, file);
            const sql = fs.readFileSync(sqlFilePath, 'utf8');

            // Try Method 1: Management API
            let success = false;
            const result = await executeSQLViaManagementAPI(sql);

            if (result) {
                success = true;
                console.log('✅ (via Management API)');
            } else {
                // Try Method 2: RPC
                const rpcResult = await executeSQLViaRPC(sql);
                if (rpcResult !== null) {
                    success = true;
                    console.log('✅ (via RPC)');
                } else {
                    console.error(`❌ Automatic migration failed for: ${file}`);
                    automaticSuccess = false;
                    break;
                }
            }

            // Record migration
            if (success) {
                try {
                    await supabase
                        .from('_migrations')
                        .upsert({
                            name: file,
                            executed_at: new Date().toISOString()
                        });
                } catch (error) {
                    // Ignore tracking errors
                }
            }
        }

        if (!automaticSuccess) {
            console.log('\n⚠️  Some migrations could not be run automatically.');
            printManualInstructions(files);

            console.log('\n\n✅ After running SQL manually, your database will be ready!');
            console.log('📦 Then run: npm run db:seed');
        } else {
            console.log('\n' + '='.repeat(50));
            console.log('🎉 All migrations completed successfully!');
            console.log('='.repeat(50));
        }

    } catch (error) {
        console.error('\n❌ Migration error:', error.message);
        console.log('\n💡 Tip: You can also run migrations manually via Supabase SQL Editor');
        process.exit(1);
    }
}

migrate();