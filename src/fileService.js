const fs = require('fs');

const isFileWriteable = filePath => {
  try {
    fs.accessSync(filePath, fs.constants.W_OK);
    return true;
  } catch (e) {
    return false;
  }
};

const doesFileExist = filePath => {
  let fileStats;
  // get stats, used to determine if we have a file or not.
  try {
    fileStats = fs.statSync(filePath);
  } catch (e) {
    return false;
  }

  // if it's a file, good. now, is it _writeable_?
  if (fileStats.isFile()) {
    try {
      fs.accessSync(filePath, fs.constants.F_OK);
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
};

module.exports = {
  isFileWriteable,
  doesFileExist,
};
