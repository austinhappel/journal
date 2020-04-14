const Handlebars = require('handlebars');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const format = require('date-fns/format/index.js');
const sub = require('date-fns/sub/index.js');
const {
  getFormalDate,
  getOrderedDate,
  getFormalDateFromOrderedDate,
} = require('./dateService.js');
const { getConfig } = require('./configService.js');
const { doesFileExist } = require('./fileService.js');
const config = getConfig();

const findTemplateFiles = templatePath => {
  const files = fs.readdirSync(templatePath);
  const fileTemplates = files.reduce((acc, fileName) => {
    if (fileName.endsWith('.hbs')) {
      templateName = fileName.replace('.hbs', '');
      acc[templateName] = path.join(templatePath, fileName);
    }
    return acc;
  }, {});
  return fileTemplates;
};

/**
 * Gets most recent journal entry as template path
 */
const getPreviousTemplate = async targetFilePath => {
  // TODO: find a more efficient way to do this?
  // Generate date filenames starting with the day before yesterday,
  // keep going down until you get a hit. Stop if we've exhausted all files
  // or we find a hit.
  const entryPath = path.join(config.journalRootPath, config.entryDirectoryName);
  const entries = fs.readdirSync(entryPath);
  let mostRecentEntryDate;
  let mostRecentEntryFilename;
  const now = Date.now();
  for (let i = 0; i < entries.length; i++) {
    mostRecentEntryDate = getOrderedDate(sub(now, { days: i + 1 }));
    let fileName = `${mostRecentEntryDate}.md`;
    let entryIndex = entries.indexOf(fileName);
    if (entryIndex > -1) {
      mostRecentEntryFilename = entries[entryIndex];
      break;
    }
  }

  if (!mostRecentEntryFilename) {
    console.log('Could not find an entry for you. Aborting.');
    process.exit();
  }

  return inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'useFileAsTemplate',
        message: `Last journal entry is ${mostRecentEntryFilename}, (${getFormalDateFromOrderedDate(
          mostRecentEntryDate
        )})
Use this file as template?`,
      },
    ])
    .then(answers => {
      if (answers.useFileAsTemplate === true) {
        return path.join(entryPath, mostRecentEntryFilename);
      }
      console.log('Aborting.');
      process.exit();
    });
};

const getTemplates = () => {
  const userTemplatePath = path.join(
    config.journalRootPath,
    config.templateDirectoryName
  );

  const defaultTemplates = {
    previous: getPreviousTemplate,
  };
  const userTemplates = findTemplateFiles(userTemplatePath);

  const templates = {
    ...defaultTemplates,
    ...userTemplates,
    blank: undefined, // You should always be able to create an empty journal entry
  };

  return templates;
};

const getTemplateVariables = () => {
  return {
    formalDate: getFormalDate(),
    orderedDate: getOrderedDate(),
  };
};

const getCompiledTemplate = (filePath, templateVariables) => {
  const templateData = fs.readFileSync(filePath, 'utf8');
  const template = Handlebars.compile(templateData);
  return template(templateVariables);
};

const writeTemplateToFile = async (templateName, filePath) => {
  if (templateName === 'blank') {
    fs.writeFileSync(filePath, '', 'utf8');
    console.log('File written to', filePath);
    return;
  }

  let templateFilePath = getTemplates()[templateName];

  // if the path is a function, run it, assuming it'll return the path to a template file.
  // This is used for the 'yesterday' custom function.
  // assume async function
  if (typeof templateFilePath === 'function') {
    templateFilePath = await templateFilePath(filePath);
  }

  if (!templateFilePath) {
    console.warn('No template found. Stopping.');
    throw new Error('No template found.');
    return;
  }

  const compiledTemplate = getCompiledTemplate(
    templateFilePath,
    getTemplateVariables()
  );

  fs.writeFileSync(filePath, compiledTemplate, 'utf8');
  console.log('File written to', filePath);
};

module.exports = {
  writeTemplateToFile,
  getTemplates,
};
