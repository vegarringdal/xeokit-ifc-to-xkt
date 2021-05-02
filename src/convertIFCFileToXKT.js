const fs = require("fs");
const {convertIFCDataToXKT} = require("./convertIFCDataToXKT.js");

/**
 * Converts an IFC STEP file into an XKT file.
 *
 * Use this for on-disk file conversion.
 *
 * @param {String} ifcPath Path to IFC source file.
 * @param {String} xktPath Path to XKT target file.
 * @return {Promise<void>}
 */
async function convertIFCFileToXKT(ifcPath, xktPath) {
    const ifcArrayBuffer = await fs.readFileSync(ifcPath);
    const xktContent = await convertIFCDataToXKT(ifcArrayBuffer);
    await fs.writeFileSync(xktPath, xktContent);
}

exports.convertIFCFileToXKT = convertIFCFileToXKT;

