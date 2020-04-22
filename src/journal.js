const inquirer = require('inquirer');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const {
  validateConfiguredFolders,
  getConfig,
  defaultConfig,
} = require('./configService.js');
const templateService = require('./templateService.js');
const { getFilenameDate } = require('./dateService.js');
const { doesFileExist, isFileWriteable } = require('./utils/fileUtils.js');

// Ideal folder structure
// Journal/
// |__/templates/
//    |__...template hbs files here
// |__/entries/
//    |__...entry markdown files here

const cliArguments = process.argv.slice(2);
const config = getConfig();

// validate paths in config before sharing config.
// TODO: this could probably be put in a separate service.
validateConfiguredFolders(config);

const getFlags = cliArguments => {
  let currentFlag;
  return cliArguments.reduce((flags, argument) => {
    if (argument.startsWith('--') || argument.startsWith('-')) {
      const argumentName = argument.startsWith('--')
        ? argument.slice(2)
        : argument.slice(1);
      currentFlag = argumentName;
      flags[currentFlag] = [];
      return flags;
    }

    if (currentFlag) {
      flags[currentFlag].push(argument);
    }

    return flags;
  }, {});
};

/**
 * Does the flag object include a template? If so, determine if it's a valid
 * template and return it.
 */
const getTemplateFromFlags = (flags = {}) => {
  if (!flags.template) {
    return;
  }

  // In the future, we can read template files from the filesystem and add them here
  const validTemplates = templateService.getTemplates();
  if (validTemplates.includes(flags.template[0])) {
    return flags.template[0];
  }
};

const requestTemplate = async () => {
  const templateList = Object.keys(templateService.getTemplates());
  return inquirer
    .prompt([
      {
        type: 'list',
        name: 'template',
        message: 'Choose a template for the journal entry.',
        choices: templateList,
      },
    ])
    .then(answers => {
      //if (answers.template === 'yesterday') {
      // TODO: find yesterday's journal entry
      // } else {
      // TODO: 1. check if today's entry exists, create today's journal entry if it does not
      //
      //}
      return answers.template;
    });
};

const getTodaysJournalEntryFilename = () => {
  return `${getFilenameDate()}.md`;
};

const getTodaysJournalEntryFilePath = () => {
  const entryFolderPath = path.join(
    config.journalRootPath,
    config.entryDirectoryName,
    getTodaysJournalEntryFilename()
  );

  return entryFolderPath;
};

const getJournalTemplate = async flags => {
  let template = getTemplateFromFlags(flags);
  if (!template) {
    template = await requestTemplate();
  }
  return template;
};

const createJournalEntry = async (template, filePath) => {
  return await templateService.writeTemplateToFile(template, filePath);
};

// TODO: Add support for other editors.
// open up the editor of choice, with the file open.
const openEditor = filePath => {
  const config = getConfig();
  let editorCommand;
  let processStdioSetting;
  let processShellSetting;
  try {
    editorCommand = config.editor.command;
    processStdioSetting = config.editor.processSettings.stdio;
    processShellSetting = config.editor.processSettings.shell;
  } catch (e) {
    console.log(`You're missing editor settings.
Make sure the full .editor object is included in your settings.`);
    console.log(defaultConfig);
  }

  if (isFileWriteable) {
    const editor = spawn(editorCommand, [filePath], {
      stdio: processStdioSetting,
      shell: processShellSetting,
    });
  } else {
    console.log(
      `Error: cannot edit the file (${filePath}). Check permissions.`
    );
  }
};

// Start the app
const init = async () => {
  const flags = getFlags(cliArguments);
  const todaysJournalFilePath = getTodaysJournalEntryFilePath();
  if (doesFileExist(todaysJournalFilePath)) {
    console.log("Today's journal entry already exists. Editing now.");
    openEditor(todaysJournalFilePath);
  } else {
    console.log(`New journal entry. (${getTodaysJournalEntryFilename()})`);

    let journalTemplate;
    try {
      journalTemplate = await getJournalTemplate(flags);
    } catch (e) {
      console.log('Exiting.');
      console.log(e.message);
      process.exit();
      return;
    }

    await createJournalEntry(journalTemplate, todaysJournalFilePath);
    openEditor(todaysJournalFilePath);
  }
};

module.exports = init;
