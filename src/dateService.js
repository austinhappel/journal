const format = require("date-fns/format/index.js");
const parse = require('date-fns/parse/index.js');
const getFormalDate = (date = Date.now()) => {
  return format(date, "EEEE LLLL d, y"); // for titles, etc
};

const getOrderedDate = (date = Date.now()) => {
  return format(date, "yyyyMMdd"); // for programmatic finding, filenames, etc.
};

const getFilenameDate = () => getOrderedDate();

const getFormalDateFromOrderedDate = orderedDateString => {
  const parsedDate = parse(orderedDateString, "yyyyMMdd", new Date());
  return getFormalDate(parsedDate);
};

module.exports = {
  getFormalDate,
  getOrderedDate,
  getFilenameDate,
  getFormalDateFromOrderedDate
};
