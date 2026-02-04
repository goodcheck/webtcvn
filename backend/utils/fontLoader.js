const https = require('https');
const fs = require('fs');
const path = require('path');

const FONT_URL = 'https://github.com/google/fonts/raw/main/apache/roboto/Roboto-Regular.ttf';
const FONTS_DIR = path.join(__dirname, '..', 'fonts');
const FONT_PATH = path.join(FONTS_DIR, 'Roboto-Regular.ttf');

async function downloadFont() {
    if (!fs.existsSync(FONTS_DIR)) {
        fs.mkdirSync(FONTS_DIR, { recursive: true });
    }

    if (fs.existsSync(FONT_PATH)) {
        console.log('Font already exists.');
        return FONT_PATH;
    }

    console.log('Downloading font...');
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(FONT_PATH);
        https.get(FONT_URL, (response) => {
            if (response.statusCode !== 200) {
                // Handle redirects
                if (response.statusCode === 302 || response.statusCode === 301) {
                    https.get(response.headers.location, (res2) => {
                        res2.pipe(file);
                        file.on('finish', () => {
                            file.close();
                            resolve(FONT_PATH);
                        });
                    }).on('error', reject);
                    return;
                }
                reject(new Error(`Failed to download font: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log('Font downloaded successfully.');
                resolve(FONT_PATH);
            });
        }).on('error', (err) => {
            fs.unlink(FONT_PATH, () => { });
            reject(err);
        });
    });
}

module.exports = { downloadFont, FONT_PATH };
