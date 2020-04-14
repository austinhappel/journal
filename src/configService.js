const fs = require('fs');
const os = require('os');
const path = require('path');

const defaultConfig = {
  journalRootPath: '~/Documents/Journal',
  templateDirectoryName: 'templates',
  entryDirectoryName: 'entries',
  editor: {
    command: 'nvim',
    processSettings: {
      stdio: 'inherit',
      shell: true,
    },
  },
};

const CONSTANTS = {
  CONFIG_PATH: path.resolve(os.homedir(), '.journal.config.json'),
};

// TODO: make this better
const cleanConfigData = (config = {}) => {
  if (config.journalRootPath.startsWith('~')) {
    config.journalRootPath = path.join(
      os.homedir(),
      '/',
      config.journalRootPath.slice(1)
    );
  }
  return config;
};

/**
 * Validates that the path/folders in the config file actually exist.
 */
const validateConfiguredFolders = config => {
  if (!fs.existsSync(config.journalRootPath)) {
    console.log('Creating journal directory', config.journalRootPath);
    fs.mkdirSync(config.journalRootPath);
  }

  const templatePath = path.join(
    config.journalRootPath,
    config.templateDirectoryName
  );
  if (!fs.existsSync(templatePath)) {
    console.log('Creating journal directory', templatePath);
    fs.mkdirSync(templatePath);
  }

  const entryPath = path.join(
    config.journalRootPath,
    config.entryDirectoryName
  );
  if (!fs.existsSync(entryPath)) {
    console.log('Creating journal directory', entryPath);
    fs.mkdirSync(entryPath);
  }
};

// read the .journal.config.js file
const getConfig = () => {
  let config = defaultConfig;
  let userConfigData = {};
  if (fs.existsSync(CONSTANTS.CONFIG_PATH)) {
    // if configuration exists...
    try {
      let userConfigData = JSON.parse(
        fs.readFileSync(CONSTANTS.CONFIG_PATH, 'utf8')
      );
    } catch (e) {
      console.warn(
        'There was an error reading your config file. Make sure it is valid JSON.'
      );
    }
    config = { ...defaultConfig, ...userConfigData };
  } else {
    // if not, just use default.
    config = defaultConfig;
  }

  const cleanConfig = cleanConfigData(config);

  // validate paths in config before sharing config.
  // TODO: this could probably be put in a separate service.
  validateConfiguredFolders(cleanConfig);
  return cleanConfig;
};

module.exports = {
  getConfig,
  defaultConfig,
};
