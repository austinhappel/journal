const https = require('https');
const fs = require('fs');

/**
 * Downloads desired file at the url, writes it to the desired path.
 * Does NOT change file permissions.
 */
const downloadFile = (fileUrl, targetPath) => {
  return new Promise((resolve, reject) => {
    https
      .get(fileUrl, response => {
        const { statusCode } = response;
        if (statusCode !== 200) {
          reject(`Bad status code: ${statusCode}`);
        }

        response.setEncoding('utf8');
        let rawData = '';
        response.on('data', chunk => {
          rawData += chunk;
        });
        response.on('end', () => {
          fs.writeFileSync(targetPath, rawData, 'utf8');
          resolve();
        });
      })
      .on('error', e => {
        console.error(`Got error: ${e.message}`);
        reject(e);
      });
  });
};

module.exports = downloadFile;
