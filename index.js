require('dotenv').config();
const { getWarUpdates } = require('./services/ai-news');
const { sendEmailUpdates } = require('./services/mail');
const { getAllActiveConfigs, updateLastRun } = require('./services/db');

// Helper for delay to avoid API rate limits
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    console.log("----------------------------------------");
    console.log(`Starting AI Agent Engine at ${new Date().toLocaleString()}`);
    console.log("----------------------------------------");

    try {
        // Step 1: Fetch ALL Active Configs from Supabase
        console.log("Fetching active news streams...");
        const configs = await getAllActiveConfigs();
        
        if (configs.length === 0) {
            console.log("No active news streams found. Exiting.");
            return;
        }

        console.log(`Detected ${configs.length} active streams to process.`);

        for (const config of configs) {
            console.log(`\n>> Processing Stream: "${config.news_topic}" (ID: ${config.id})`);
            
            try {
                // 2. Dynamic Schedule Check (Accounting for Timezone)
                const now = new Date();
                const utcHour = now.getUTCHours();
                const offset = 5; // PKT
                const currentHour = (utcHour + offset) % 24;
                
                const allowedHours = config.run_hours.split(',').map(h => parseInt(h.trim()));
                
                console.log(`   - Time Info: UTC=${utcHour}:00 | PKT=${currentHour}:00 | Allowed=${config.run_hours}`);
                
                if (!allowedHours.includes(currentHour)) {
                    console.log("   - [SKIP] Current hour is not scheduled for this stream.");
                    continue;
                }

                // 3. Fetch AI-summarized updates
                const updates = await getWarUpdates(config.news_topic, config.language, config.tone);

                if (!updates || updates.length === 0) {
                    console.log("   - [SKIP] No news updates found for this topic.");
                    continue;
                }

                console.log(`   - [DONE] Retrieved ${updates.length} updates.`);

                // 4. Send email
                await sendEmailUpdates(updates, config.receiver_emails);

                // 5. Update last run
                await updateLastRun(config.id);
                console.log("   - [SUCCESS] Stream processed completely.");

                // Small delay between streams to avoid hitting AI/Mail quotas too fast
                await sleep(2000);

            } catch (innerError) {
                console.error(`   - [ERROR] Failed to process stream "${config.news_topic}":`, innerError.message);
            }
        }

        console.log("\n----------------------------------------");
        console.log("AI Agent Engine: All streams processed.");
        console.log("----------------------------------------");

    } catch (error) {
        console.error("Critical engine error:", error.message);
    }
}

// Execute the main function
main();
