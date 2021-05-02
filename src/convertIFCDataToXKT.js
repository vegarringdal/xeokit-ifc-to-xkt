const {writeXKTModelToArrayBuffer, XKTModel} = require("@xeokit/xeokit-xkt-utils/dist/xeokit-xkt-utils.cjs.js");
const {parseIFCIntoXKTModel} = require("./parseIFCIntoXKTModel.js");

/**
 * Converts IFC file data into XKT file data.
 *
 * Use this for in-memory file conversion.
 *
 * @param {Arraybuffer} ifcArrayBuffer The IFC file data.
 * @return {Promise<Buffer>} The XKT file data.
 */
async function convertIFCDataToXKT(ifcArrayBuffer) {
    const xktModel = new XKTModel();
    await parseIFCIntoXKTModel(ifcArrayBuffer, xktModel);
    xktModel.finalize();
    const xktArrayBuffer = writeXKTModelToArrayBuffer(xktModel);
    const xktContent = Buffer.from(xktArrayBuffer);
    return xktContent;
}

exports.convertIFCDataToXKT = convertIFCDataToXKT;

