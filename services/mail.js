require('dotenv').config();
const nodemailer = require('nodemailer');

// Ensure that exactly 3 parameters are passed here: the user, pass, and recipient list (which will be to the user themselves for alerts)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

function generateEmailHTML(updates) {
    let emailContent = `
    <!DOCTYPE html>
    <html lang="ur">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
            
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background-color: #f8fafc;
                color: #1e293b;
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
            }
            .wrapper {
                width: 100%;
                table-layout: fixed;
                background-color: #f8fafc;
                padding-top: 40px;
                padding-bottom: 40px;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            .header {
                background-color: #0f172a;
                padding: 32px 24px;
                text-align: center;
            }
            .header h1 {
                color: #f8fafc;
                margin: 0;
                font-size: 22px;
                font-weight: 800;
                letter-spacing: -0.025em;
                text-transform: uppercase;
            }
            .header p {
                color: #94a3b8;
                margin: 8px 0 0;
                font-size: 13px;
                font-weight: 500;
            }
            .content {
                padding: 24px;
            }
            .news-card {
                margin-bottom: 24px;
                padding: 20px;
                background-color: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                transition: transform 0.2s ease;
            }
            .headline {
                font-size: 17px;
                font-weight: 700;
                color: #e11d48;
                margin-bottom: 8px;
                line-height: 1.4;
            }
            .summary {
                font-size: 14px;
                line-height: 1.6;
                color: #334155;
                margin-bottom: 16px;
                font-weight: 400;
            }
            .meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-top: 1px solid #f1f5f9;
                padding-top: 12px;
                font-size: 11px;
                color: #64748b;
                font-weight: 600;
                text-transform: uppercase;
            }
            .source-tag {
                background-color: #f1f5f9;
                padding: 4px 8px;
                border-radius: 4px;
                color: #475569;
            }
            .footer {
                padding: 24px;
                text-align: center;
                background-color: #f1f5f9;
            }
            .footer p {
                margin: 0;
                font-size: 12px;
                color: #64748b;
                font-weight: 500;
            }
            @media only screen and (max-width: 600px) {
                .container {
                    width: 100% !important;
                    border-radius: 0 !important;
                }
                .header {
                    padding: 24px 16px;
                }
                .headline {
                    font-size: 16px;
                }
            }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <h1>Iran vs Israel Updates</h1>
                    <p>Taza Tareen AI Summaries • Roman Urdu Mein</p>
                </div>
                <div class="content">
    `;

    updates.forEach((update) => {
        emailContent += `
                    <div class="news-card">
                        <div class="headline">${update.headline}</div>
                        <div class="summary">${update.summary}</div>
                        <div class="meta">
                            <span class="source-tag">${update.source}</span>
                            <span>${update.timestamp}</span>
                        </div>
                    </div>
        `;
    });

    emailContent += `
                </div>
                <div class="footer">
                    <p>Automated Update Agent • Node.js & Google Gemini</p>
                    <p style="margin-top: 4px;">Date: 2026-03-12</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    return emailContent;
}

async function sendEmailUpdates(updates) {
    console.log("Preparing to send email...");
    
    if (!updates || updates.length === 0) {
        console.log("No updates to send.");
        return;
    }

    const htmlContent = generateEmailHTML(updates);

    const mailOptions = {
        from: `"War Updates Agent" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER, // Sending to yourself, or modify if using a list
        subject: `Latest Iran vs Israel/US Updates - ${new Date().toLocaleDateString()}`,
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully: ${info.messageId}`);
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

module.exports = {
    sendEmailUpdates
};
