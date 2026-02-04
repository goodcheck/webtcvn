const https = require('https');
const fs = require('fs');
const path = require('path');

const FONT_URL = 'https://raw.githubusercontent.com/google/fonts/main/apache/roboto/Roboto-Regular.ttf';
const FONTS_DIR = path.join(__dirname, '..', 'fonts');
const FONT_PATH = path.join(FONTS_DIR, 'Roboto-Regular.ttf');

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);

        const request = https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                file.close();
                fs.unlinkSync(dest);
                return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
            }

            if (response.statusCode !== 200) {
                file.close();
                fs.unlinkSync(dest);
                return reject(new Error(`Failed to download: ${response.statusCode}`));
            }

            response.pipe(file);

            file.on('finish', () => {
                file.close();
                // Check if file is small (likely an error page or empty)
                const stats = fs.statSync(dest);
                if (stats.size < 10000) { // Roboto-Regular should be ~160KB
                    fs.unlinkSync(dest);
                    return reject(new Error('Downloaded file too small, possibly corrupted'));
                }
                resolve(dest);
            });
        });

        request.on('error', (err) => {
            file.close();
            if (fs.existsSync(dest)) fs.unlinkSync(dest);
            reject(err);
        });

        request.end();
    });
}

async function downloadFont() {
    if (!fs.existsSync(FONTS_DIR)) {
        fs.mkdirSync(FONTS_DIR, { recursive: true });
    }

    if (fs.existsSync(FONT_PATH)) {
        const stats = fs.statSync(FONT_PATH);
        if (stats.size > 10000) {
            return FONT_PATH;
        }
        fs.unlinkSync(FONT_PATH);
    }

    console.log('Downloading font from:', FONT_URL);
    return await downloadFile(FONT_URL, FONT_PATH);
}

module.exports = { downloadFont, FONT_PATH };
