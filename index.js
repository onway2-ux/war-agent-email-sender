require('dotenv').config();
const { getWarUpdates } = require('./services/ai-news');
const { sendEmailUpdates } = require('./services/mail');

async function main() {
    console.log("----------------------------------------");
    console.log(`Starting AI War Updates Agent at ${new Date().toLocaleString()}`);
    console.log("----------------------------------------");

    try {
        // Step 1: Fetch the latest AI-summarized updates
        const updates = await getWarUpdates();

        // Check if there are updates available
        if (!updates || updates.length === 0) {
            console.log("No updates found today. Exiting.");
            return;
        }

        console.log(`Retrieved ${updates.length} top updates.`);

        // Step 2: Format and send the email
        await sendEmailUpdates(updates);

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
