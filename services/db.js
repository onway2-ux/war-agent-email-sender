const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env file");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getBotConfig() {
    try {
        const { data, error } = await supabase
            .from('bot_config')
            .select('*')
            .single();

        if (error) {
            console.error("Error fetching bot config:", error);
            // Return defaults if DB fetch fails
            return {
                news_topic: 'Iran vs Israel / US conflict',
                language: 'Roman Urdu',
                tone: 'Professional',
                receiver_emails: 'muhammadsayban1123@gmail.com',
                run_hours: '6,14,21',
                is_active: true
            };
        }

        return data;
    } catch (err) {
        console.error("Supabase connection error:", err);
        return {
            news_topic: 'Iran vs Israel / US conflict',
            language: 'Roman Urdu',
            tone: 'Professional',
            receiver_emails: 'muhammadsayban1123@gmail.com',
            run_hours: '6,14,21',
            is_active: true
        };
    }
}

async function updateLastRun() {
    try {
        await supabase
            .from('bot_config')
            .update({ last_run_timestamp: new Date().toISOString() })
            .eq('id', 1); // Assuming we have one config row with ID 1
    } catch (err) {
        console.error("Error updating last run timestamp:", err);
    }
}

module.exports = {
    getBotConfig,
    updateLastRun
};
