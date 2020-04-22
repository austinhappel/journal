const fs = require('fs');
const os = require('os');
const path = require('path');
const downloadFile = require('./utils/downloadFile.js');
const inquirer = require('inquirer');

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
  BASE_TEMPLATE_URL:
    'https://raw.githubusercontent.com/austinhappel/journal/master/templates/journalEntry.hbs',
  BASE_TEMPLATE_FILE_NAME: 'journalEntry.hbs',
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
const validateConfiguredFolders = async config => {
  let needsBaseTemplate = false; // true if we are creating a template directory for the first time.
  if (!fs.existsSync(config.journalRootPath)) {
    console.log('Creating journal directory', config.journalRootPath);
    fs.mkdirSync(config.journalRootPath);
  }

  const templatePath = path.join(
    config.journalRootPath,
    config.templateDirectoryName
  );

  if (!fs.existsSync(templatePath)) {
    console.log('Creating template directory', templatePath);
    fs.mkdirSync(templatePath);
    needsBaseTemplate = true;
  }

  const entryPath = path.join(
    config.journalRootPath,
    config.entryDirectoryName
  );

  if (!fs.existsSync(entryPath)) {
    console.log('Creating entries directory', entryPath);
    fs.mkdirSync(entryPath);
  }

  if (needsBaseTemplate) {
    await downloadAndInstallBaseTemplate(); // ask to see if user wants the base template installed, install it.
  }
};

/**
 * Copy the basic template over if it doesn't exist
 */
const downloadAndInstallBaseTemplate = async () => {
  const config = getConfig();
  const { BASE_TEMPLATE_FILE_NAME, BASE_TEMPLATE_URL } = CONSTANTS;
  return inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'installBaseTemplate',
        message: 'You have no journal templates. Want to install one?',
      },
    ])
    .then(async answers => {
      if (answers.installBaseTemplate) {
        console.log('Installing base template.');
        const templateFilePath = path.join(
          config.journalRootPath,
          config.templateDirectoryName,
          `${BASE_TEMPLATE_FILE_NAME}`
        );
        console.log('Downloading...');
        try {
          let test = await downloadFile(BASE_TEMPLATE_URL, templateFilePath);
          console.log(`Base template installed at ${templateFilePath}`);
        } catch (e) {
          console.log('Error downloading template.', e);
        }
      }
    });
};

// read the .journal.config.js file
const getConfig = () => {
  let config = defaultConfig;
  let userConfigData = {};
  if (fs.existsSync(CONSTANTS.CONFIG_PATH)) {
    let userConfigData = {};
    // if configuration exists...
    try {
      userConfigData = JSON.parse(
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

  return cleanConfig;
};

module.exports = {
  validateConfiguredFolders,
  getConfig,
  defaultConfig,
};
