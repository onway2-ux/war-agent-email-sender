const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env file");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getAllActiveConfigs() {
    try {
        const { data, error } = await supabase
            .from('bot_config')
            .select('*')
            .eq('is_active', true);

        if (error) {
            console.error("Error fetching bot configs:", error);
            return []; // Return empty list to avoid crashes
        }

        return data || [];
    } catch (err) {
        console.error("Supabase connection error:", err);
        return [];
    }
}

async function updateLastRun(id) {
    try {
        await supabase
            .from('bot_config')
            .update({ last_run_timestamp: new Date().toISOString() })
            .eq('id', id);
    } catch (err) {
        console.error(`Error updating last run for ID ${id}:`, err);
    }
}

module.exports = {
    getAllActiveConfigs,
    updateLastRun
};
