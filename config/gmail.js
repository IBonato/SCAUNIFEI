const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const nodemailer = require('nodemailer');

async function createTransporter() {
    try {
        const oAuth2Client = new OAuth2(
            process.env.OAUTH_CLIENT_ID,
            process.env.OAUTH_SECRET,
            "https://developers.google.com/oauthplayground"
        );

        oAuth2Client.setCredentials({
            refresh_token: process.env.REFRESH_TOKEN
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
                serviceClient: process.env.OAUTH_SERVICE_CLIENT_ID,
                privateKey: process.env.OAUTH_SERVICE_PRIVATE_KEY,
                accessToken: accessToken
            }
        });

        return transport
    } catch (err) {
        console.error('Error creating Transporter', err);
    }
}

module.exports = { createTransporter }