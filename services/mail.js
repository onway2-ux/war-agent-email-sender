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
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                background-color: #f0f2f5;
                color: #1c1e21;
                margin: 0;
                padding: 40px 20px;
                -webkit-font-smoothing: antialiased;
            }
            .container {
                max-width: 640px;
                margin: auto;
                background: #ffffff;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 25px rgba(0,0,0,0.05);
            }
            .header {
                background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                padding: 30px;
                text-align: center;
                color: white;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                letter-spacing: 0.5px;
            }
            .header p {
                margin: 10px 0 0;
                font-size: 15px;
                opacity: 0.9;
            }
            .content {
                padding: 30px;
            }
            .news-item {
                margin-bottom: 35px;
                padding-bottom: 35px;
                border-bottom: 1px solid #eef0f2;
                display: flex;
                flex-direction: column;
            }
            .news-item:last-child {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
            }
            .news-image {
                width: 100%;
                height: 240px;
                object-fit: cover;
                border-radius: 12px;
                margin-bottom: 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            }
            .headline {
                font-size: 24px;
                font-weight: 800;
                color: #d32f2f;
                margin-bottom: 12px;
                line-height: 1.3;
            }
            .summary {
                font-size: 16px;
                line-height: 1.6;
                color: #4a4a4a;
                margin-bottom: 15px;
            }
            .meta {
                display: flex;
                justify-content: space-between;
                font-size: 13px;
                color: #888;
                background: #f8f9fa;
                padding: 10px 15px;
                border-radius: 8px;
                font-weight: 500;
            }
            .footer {
                background: #f8f9fa;
                padding: 20px;
                text-align: center;
                font-size: 13px;
                color: #777;
                border-top: 1px solid #eee;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Iran vs Israel/US Updates</h1>
                <p>Taza Tareen Khabrain - AI Dawara Tayar Karda</p>
            </div>
            <div class="content">
    `;

    updates.forEach((update) => {
        emailContent += `
                <div class="news-item">
                    <div class="headline">${update.headline}</div>
                    <div class="summary">${update.summary}</div>
                    <div class="meta">
                        <span><strong>Source:</strong> ${update.source}</span>
                        <span><strong>Waqt:</strong> ${update.timestamp}</span>
                    </div>
                </div>
        `;
    });

    emailContent += `
            </div>
            <div class="footer">
                🚀 Automated daily update agent • Node.js & AI Powered
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
