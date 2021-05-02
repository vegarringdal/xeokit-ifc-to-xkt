const {convertIFCFileToXKT} = require('./src/convertIFCFileToXKT.js');
const {convertIFCDataToXKT} = require('./src/convertIFCDataToXKT.js');
const {parseIFCIntoXKTModel} = require('./src/parseIFCIntoXKTModel.js');

module.exports.convertIFCFileToXKT = convertIFCFileToXKT;
module.exports.convertIFCDataToXKT = convertIFCDataToXKT;
module.exports.parseIFCIntoXKTModel = parseIFCIntoXKTModel;