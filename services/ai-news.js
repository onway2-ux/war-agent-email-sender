require('dotenv').config();
const axios = require('axios');

async function getWarUpdates() {
    try {
        console.log("Fetching latest news updates...");
        
        // Using the Google Gemini REST API (gemini-2.5-flash)
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, 
            {
                "system_instruction": {
                    "parts": { 
                        "text": "Today's date is 2026-03-12. You are a highly accurate news aggregator reporting on the Iran vs Israel / US conflict. Summarize the top 5 most important and recent news events from the LAST 24 HOURS ONLY. CRITICAL RULES: 1. You MUST write in easy-to-read Roman Urdu. 2. Keep the content very minimal and to the point (a short headline and a 1-sentence summary). 3. Ensure news is strictly current (March 2026); DO NOT provide old news from 2024. Filter out any duplicates. Format the response strictly as a JSON array of objects. Each object must have exactly these keys: 'headline' (string in Roman Urdu), 'summary' (string in Roman Urdu), 'source' (string, name of the news outlet), and 'timestamp' (string, approximate time)." 
                    }
                },
                "contents": [
                    {
                        "parts": [
                            { "text": "Give me the top 5 latest updates on the Iran vs Israel / US conflict." }
                        ]
                    }
                ],
                "generationConfig": {
                    "response_mime_type": "application/json"
                }
            },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        const aiMessage = response.data.candidates[0].content.parts[0].text;
        
        let updates = [];
        try {
            // Find JSON array in the text 
            const jsonStr = aiMessage.match(/\[[\s\S]*\]/)[0];
            updates = JSON.parse(jsonStr);
        } catch (parseError) {
            console.error("Failed to parse JSON directly from AI response. Raw response was:", aiMessage);
            throw new Error("Could not parse AI response into JSON format.");
        }

        console.log(`Successfully fetched ${updates.length} updates.`);
        return updates;

    } catch (error) {
        console.error("Error fetching updates:");
        if (error.response) {
            console.error("- Status:", error.response.status);
            console.error("- Response Data:", error.response.data);
        } else {
            console.error("- Message:", error.message);
        }
        throw error;
    }
}

module.exports = {
    getWarUpdates
};
