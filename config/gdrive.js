const fs = require('fs');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

async function getAuthorization() {
    try {
        const oAuth2Client = new OAuth2(
            process.env.OAUTH_CLIENT_ID_DRIVE,
            process.env.OAUTH_SECRET_DRIVE,
            "https://developers.google.com/oauthplayground"
        );

        oAuth2Client.setCredentials({
            refresh_token: process.env.DRIVE_REFRESH_TOKEN
        });

        const accessToken = await new Promise((resolve, reject) => {
            oAuth2Client.getAccessToken((err, token) => {
                if (err) {
                    reject("Failed to create access token!");
                }
                resolve(token);
            });
        });
        oAuth2Client.setCredentials({
            access_token: accessToken
        });

        return oAuth2Client;
    } catch (err) {
        console.error('Error retrieving Authorization', err);
    }
}

/*
let jwtClient = new google.auth.JWT(
            privatekey.client_email,
            null,
            privatekey.private_key,
            ['https://www.googleapis.com/auth/drive']);

        jwtClient.authorize(function (err, tokens) {
            if (err) {
                console.log(err);
                return;
            }
        });

        return jwtClient;
*/

async function listFiles(folderId) {
    const oauthClient = await getAuthorization();
    const drive = google.drive({ version: 'v3', auth: oauthClient });
    try {
        let res = await new Promise((resolve, reject) => {
            drive.files.list({
                q: `'${folderId}' in parents and trashed=false`,
                fields: 'files(id, name, webViewLink)',
                orderBy: 'createdTime'
            }, function (err, res) {
                if (err) {
                    reject(err);
                }
                resolve(res);
            });
        });
        return res.data;
    } catch (err) {
        return console.log('The API returned an error: ' + err);
    }
}

async function fileUpload(fileName, filePath, mimeType, folderId) {
    const oauthClient = await getAuthorization();
    const fileMetadata = {
        name: fileName,
        parents: [folderId]
    };
    const media = {
        mimeType,
        body: fs.createReadStream(filePath)
    }

    const drive = google.drive({ version: 'v3', auth: oauthClient });
    try {
        const file = await drive.files.create({
            resource: fileMetadata,
            media: media
        });

        return file.data.id;
    } catch (err) {
        return console.log('The API returned an error: ' + err);
    }
}

async function createFolder(folderName) {
    const oauthClient = await getAuthorization();
    const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
    };
    const permission = {
        type: 'anyone',
        role: 'reader'
    };

    const drive = google.drive({ version: 'v3', auth: oauthClient });
    try {
        const folder = await drive.files.create({
            resource: fileMetadata,
            fields: 'id'
        });

        const result = await drive.permissions.create({
            resource: permission,
            fileId: folder.data.id,
            fields: 'id',
        });

        console.log('Permission for ' + result.data.id + ' created!')
        console.log('Folder ' + folder.data.id + ' created!')
        return folder.data.id;
    } catch (err) {
        return console.log('The API returned an error: ' + err);
    }
}

async function deleteFolder(folderId) {
    const oauthClient = await getAuthorization();
    const drive = google.drive({ version: 'v3', auth: oauthClient });

    try {
        await drive.files.delete({
            mimeType: 'application/vnd.google-apps.folder',
            fileId: folderId
        });

        return console.log('Folder ' + folderId + ' deleted!');
    } catch (err) {
        return console.log('The API returned an error: ' + err);
    }
}

async function deleteFile(fileId) {
    const oauthClient = await getAuthorization();
    const drive = google.drive({ version: 'v3', auth: oauthClient });

    try {
        await drive.files.delete({
            fileId: fileId
        });

        return console.log('File ' + fileId + ' deleted!');
    } catch (err) {
        return console.log('The API returned an error: ' + err);
    }
}

module.exports = { listFiles, fileUpload, createFolder, deleteFolder, deleteFile }