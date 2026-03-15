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
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    let emailContent = `
    <!DOCTYPE html>
    <html lang="ur">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');
            
            body {
                font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background-color: #f1f5f9;
                color: #0f172a;
                margin: 0;
                padding: 0;
            }
            .wrapper {
                width: 100%;
                background-color: #f1f5f9;
                padding: 40px 10px;
            }
            .container {
                max-width: 520px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }
            .header {
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                padding: 40px 24px;
                text-align: center;
                border-bottom: 4px solid #e11d48;
            }
            .header h1 {
                color: #ffffff;
                margin: 0;
                font-size: 20px;
                font-weight: 800;
                letter-spacing: 1px;
                text-transform: uppercase;
            }
            .header p {
                color: #94a3b8;
                margin: 6px 0 0;
                font-size: 11px;
                font-weight: 600;
                letter-spacing: 0.5px;
            }
            .content {
                padding: 24px;
            }
            .news-card {
                margin-bottom: 20px;
                padding: 16px;
                background-color: #ffffff;
                border: 1px solid #f1f5f9;
                border-radius: 12px;
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
            }
            .headline {
                font-size: 15px;
                font-weight: 700;
                color: #e11d48;
                margin-bottom: 6px;
                line-height: 1.3;
            }
            .summary {
                font-size: 13px;
                line-height: 1.5;
                color: #334155;
                margin-bottom: 12px;
                font-weight: 400;
            }
            .meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 10px;
                border-top: 1px dashed #e2e8f0;
                font-size: 10px;
                color: #94a3b8;
                font-weight: 700;
                text-transform: uppercase;
            }
            .source-tag {
                color: #64748b;
            }
            .footer {
                padding: 24px;
                text-align: center;
                border-top: 1px solid #f1f5f9;
                background-color: #f8fafc;
            }
            .footer p {
                margin: 0;
                font-size: 11px;
                color: #94a3b8;
                font-weight: 600;
            }
            @media only screen and (max-width: 600px) {
                .container {
                    width: 100% !important;
                    border-radius: 12px !important;
                }
                .wrapper {
                    padding: 10px;
                }
            }
        </style>
    </head>
    <body>
        <div class="wrapper">
            <div class="container">
                <div class="header">
                    <h1>War Updates Report</h1>
                    <p>AI AGENT • TAZA TAREEN ROMAN URDU UPDATES</p>
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
                    <p>NODE.JS & GEMINI AI POWERED AGENT</p>
                    <p style="margin-top: 4px; color: #64748b;">Date: ${today}</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    return emailContent;
}

async function sendEmailUpdates(updates, recipients) {
    console.log(`Preparing to send email to: ${recipients}...`);
    
    if (!updates || updates.length === 0) {
        console.log("No updates to send.");
        return;
    }

    const htmlContent = generateEmailHTML(updates);

    const mailOptions = {
        from: `"War Updates Agent" <${process.env.GMAIL_USER}>`,
        to: recipients, 
        subject: `Latest Updates - ${new Date().toLocaleDateString()}`,
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
