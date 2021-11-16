const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const nodemailer = require('nodemailer');

async function createTransporter() {
    try {
        const oAuth2Client = new OAuth2(
            process.env.OAUTH_CLIENT_ID_GMAIL,
            process.env.OAUTH_SECRET_GMAIL,
            "https://developers.google.com/oauthplayground"
        );

        oAuth2Client.setCredentials({
            refresh_token: process.env.GMAIL_REFRESH_TOKEN
        });

        const accessToken = await new Promise((resolve, reject) => {
            oAuth2Client.getAccessToken((err, token) => {
                if (err) {
                    reject("Failed to create access token!");
                }
                resolve(token);
            });
        });

        const transport = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                serviceClient: process.env.OAUTH_SERVICE_ID_GMAIL,
                privateKey: process.env.OAUTH_SERVICE_PRIVATE_KEY_GMAIL,
                accessToken: accessToken
            }
        });

        return transport
    } catch (err) {
        console.error('Error creating Transporter', err);
    }
}

module.exports = { createTransporter }