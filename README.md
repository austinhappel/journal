# Journal

This app does one thing - it allows you to keep a basic journal.

The goal is to offer a fast and easy way to keep track of your daily work without the need for a fancy journal tool.

## Install

**Prerequisites**
By default you'll want to have NeoVim installed and on your command line. This is configurable - see below.

- Clone the repo
- `npm install`
- `npm run build`
- Copy the dist/journal file to a place on your $PATH, like  `~/local/bin/`

- Run the app one time. It will create the folder structure for your journal.
- Since you have no templates, it will fail to run.
- Copy the templates in the project folder (`./templates`) into the Journal/templates folder (`~/Documents/Journal/templates`)

## Usage

Use the command `journal`.

It will prompt you for a template to use. The default template is based off of an agile scrum standup meeting.

When you save, files are saved to `~/Documents/Journal/entries`.

Files are named by date. For example: `20200411.md` correlates to April 11, 2020.

You can base your daily journal off of your last journal entry as well. Just use the `previous` template. **Note** This won't work until you have an existing, older entry.

## Configuration

You can configure where your journal is installed by adding a `.journal.config.json` file to your home director. Here's how that looks:

```
{
  "journalRootPath": "~/Documents/Journal",
  "templateDirectoryName": "templates",
  "entryDirectoryName": "entries",
}
```
