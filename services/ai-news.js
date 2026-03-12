require('dotenv').config();
const axios = require('axios');

async function getWarUpdates() {
    try {
        console.log("Fetching latest news updates...");
        
        // Using the Google Gemini REST API (gemini-2.5-flash) with Search Grounding
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, 
            {
                "system_instruction": {
                    "parts": { 
                        "text": "You are a highly accurate news aggregator reporting on the Iran vs Israel / US conflict. Your goal is to provide the most recent updates available. CRITICAL RULES: 1. You MUST write in easy-to-read Roman Urdu. 2. Keep the content very minimal and to the point (a short headline and a 1-sentence summary). 3. Always search for the absolute latest news available on the web regarding this conflict. Filter out any duplicates. Format the response strictly as a JSON array of objects. Each object must have exactly these keys: 'headline' (string in Roman Urdu), 'summary' (string in Roman Urdu), 'source' (string, name of the news outlet), and 'timestamp' (string, approximate time)." 
                    }
                },
                "contents": [
                    {
                        "parts": [
                            { "text": "Retrieve the top 5 absolute latest news updates on the Iran vs Israel / US conflict from today's web results. Output as JSON array." }
                        ]
                    }
                ],
                "tools": [
                    {
                        "google_search": {}
                    }
                ]
            },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        let content = response.data.candidates[0].content.parts[0].text;
        
        // Clean JSON if the model wrapped it in markdown code blocks
        if (content.includes('```')) {
            content = content.replace(/```json\n?|```/g, '').trim();
        }

        let newsUpdates = [];
        try {
            newsUpdates = JSON.parse(content);
        } catch (parseError) {
            console.error("Failed to parse JSON directly from AI response. Raw response was:", content);
            throw new Error("Could not parse AI response into JSON format.");
        }

        const finalUpdates = newsUpdates.slice(0, 5);
        console.log(`Successfully fetched ${finalUpdates.length} updates.`);
        return finalUpdates;

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
