import { NextResponse } from 'next/server';
import axios from 'axios';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST() {
    try {
        // 1. Fetch current config from Supabase
        const { data: config, error: configError } = await supabase
            .from('bot_config')
            .select('*')
            .single();

        if (configError || !config) {
            throw new Error("Failed to fetch bot configuration");
        }

        console.log(`Manual Test Triggered: Topic="${config.news_topic}", Lang="${config.language}", Tone="${config.tone}"`);

        // 2. Fetch news from Gemini
        const geminiResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, 
            {
                "system_instruction": {
                    "parts": { 
                        "text": `You are a news aggregator. Topic: ${config.news_topic}. Language: ${config.language}. Tone: ${config.tone}. Format as JSON array of objects: 'headline', 'summary', 'source', 'timestamp'.` 
                    }
                },
                "contents": [
                    { "parts": [{ "text": `Get absolute latest 5 updates on ${config.news_topic}.` }] }
                ],
                "generationConfig": { "response_mime_type": "application/json" }
            }
        );

        let updates = [];
        try {
            const resultText = geminiResponse.data.candidates[0].content.parts[0].text;
            updates = JSON.parse(resultText);
            if (!Array.isArray(updates)) updates = updates.news || updates.updates || [];
        } catch (e) {
            console.error("JSON Parse Error:", e);
            throw new Error("Failed to parse AI news");
        }

        if (updates.length === 0) {
            return NextResponse.json({ success: false, message: "No news found for this topic." });
        }

        // 3. Send Email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #e11d48;">Manual Test Report</h2>
                <p><strong>Topic:</strong> ${config.news_topic}</p>
                <p><strong>Language:</strong> ${config.language}</p>
                <hr/>
                ${updates.slice(0, 5).map((u: any) => `
                    <div style="margin-bottom: 20px;">
                        <h3 style="margin: 0; color: #333;">${u.headline}</h3>
                        <p style="margin: 5px 0; color: #666;">${u.summary}</p>
                        <small style="color: #999;">Source: ${u.source} | ${u.timestamp}</small>
                    </div>
                `).join('')}
                <footer style="margin-top: 30px; font-size: 10px; color: #ccc; text-align: center;">
                    Sent via AI Agent Command Center | ${new Date().toLocaleString()}
                </footer>
            </div>
        `;

        await transporter.sendMail({
            from: `"Bot Test" <${process.env.GMAIL_USER}>`,
            to: config.receiver_emails,
            subject: `Test Report: ${config.news_topic}`,
            html: emailHtml
        });

        // 4. Update last run timestamp
        await supabase
            .from('bot_config')
            .update({ last_run_timestamp: new Date().toISOString() })
            .eq('id', config.id);

        return NextResponse.json({ success: true, message: "Manual test successful! Email sent." });

    } catch (error: any) {
        console.error("Manual Test Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
