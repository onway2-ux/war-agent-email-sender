require('dotenv').config();
const { getWarUpdates } = require('./services/ai-news');
const { sendEmailUpdates } = require('./services/mail');
const { getBotConfig, updateLastRun } = require('./services/db');

async function main() {
    console.log("----------------------------------------");
    console.log(`Starting AI Agent at ${new Date().toLocaleString()}`);
    console.log("----------------------------------------");

    try {
        // Step 1: Fetch Remote Config from Supabase
        console.log("Fetching remote configuration...");
        const config = await getBotConfig();
        
        if (!config.is_active) {
            console.log("Agent is disabled via Dashboard. Skipping run.");
            return;
        }

        console.log(`Config loaded: Topic="${config.news_topic}", Lang="${config.language}", Tone="${config.tone}"`);

        // 2. Dynamic Schedule Check
        const currentHour = new Date().getHours(); // 0-23 in System time
        const allowedHours = config.run_hours.split(',').map(h => parseInt(h.trim()));
        
        console.log(`Current Hour: ${currentHour}, Allowed Hours: ${allowedHours.join(', ')}`);
        
        if (!allowedHours.includes(currentHour)) {
            console.log("Current hour is not in the allowed schedule. Skipping run.");
            return;
        }

        // 3. Fetch the latest AI-summarized updates
        const updates = await getWarUpdates(config.news_topic, config.language, config.tone);

        // Check if there are updates available
        if (!updates || updates.length === 0) {
            console.log("No updates found today. Exiting.");
            return;
        }

        console.log(`Retrieved ${updates.length} top updates.`);

        // 4. Format and send the email to recipients
        await sendEmailUpdates(updates, config.receiver_emails);

        // 5. Update last run status in DB
        await updateLastRun();

        console.log("Agent run completed successfully.");

    } catch (error) {
        console.error("Critical error during agent execution:");
        // Graceful error logging
        if (error.response) {
            console.error("- Status:", error.response.status);
            console.error("- Response Data:", error.response.data);
        } else {
            console.error("- Message:", error.message);
        }
    } finally {
        console.log("----------------------------------------");
    }
}

// Execute the main function
main();
