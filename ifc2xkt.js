#!/usr/bin/env node

const fs = require('fs').promises;
const commander = require('commander');
const package = require('./package.json');
const WebIFC = require("web-ifc/web-ifc-api-node.js");
const {
    XKTModel,
    writeXKTModelToArrayBuffer
} = require("@xeokit/xeokit-xkt-utils/dist/xeokit-xkt-utils.cjs.js");

// initialize the API
const ifcApi = new WebIFC.IfcAPI();

// initialize the library
ifcApi.Init();

const program = new commander.Command();

program.version(package.version, '-v, --version');

program
    .option('-s, --source [file]', 'path to the source IFC file')
    .option('-o, --output [file]', 'path to the target XKT file');

program.on('--help', () => {
});

program.parse(process.argv);

if (program.source === undefined) {
    console.error('\n\nError: please specify source IFC path.');
    program.help();
    process.exit(1);
}

if (program.output === undefined) {
    console.error('\n\nError: please specify target xkt path.');
    program.help();
    process.exit(1);
}

async function main() {
    console.log('\n\nReading IFC file: ' + program.source);
    const xktContent = await convert(program.source);
    console.log('\n\nWriting XKT file: ' + program.output);
    await fs.writeFile(program.output, xktContent);
}

async function convert(ifcPath) {
    const xktModel = new XKTModel();
    await parseIFCIntoXKTModel(ifcPath, xktModel);
    xktModel.finalize();
    const xktArrayBuffer = writeXKTModelToArrayBuffer(xktModel);
    return Buffer.from(xktArrayBuffer);
}

main().catch(err => {
    console.error('Something went wrong:', err);
    process.exit(1);
});

async function parseIFCIntoXKTModel(ifcPath, xktModel) {

    let nextId = 0;

    const ifcArrayBuffer = await fs.readFile(ifcPath);

    await ifcApi.Init();

    const data = new Uint8Array(ifcArrayBuffer);

    const modelID = ifcApi.OpenModel(ifcPath, data);

    const flatMeshes = ifcApi.LoadAllGeometry(modelID);

    for (let i = 0, len = flatMeshes.size(); i < len; i++) {

        const flatMesh = flatMeshes.get(i);
        const entityId = "" + flatMesh.expressID;
        const placedGeometries = flatMesh.geometries;
        const meshIds = [];

        for (let j = 0, lenj = placedGeometries.size(); j < lenj; j++) {

            const placedGeometry = placedGeometries.get(j);
            const geometryId = "" + placedGeometry.geometryExpressID;

            if (!xktModel.geometries[geometryId]) {

                const geometry = ifcApi.GetGeometry(modelID, placedGeometry.geometryExpressID);
                const vertexData = ifcApi.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize());
                const indices = ifcApi.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize());

                // De-interleave vertex arrays

                const positions = [];
                const normals = [];

                for (let k = 0, lenk = vertexData.length / 6; k < lenk; k++) {

                    positions.push(vertexData[k * 6 + 0]);
                    positions.push(vertexData[k * 6 + 1]);
                    positions.push(vertexData[k * 6 + 2]);

                    normals.push(vertexData[k * 6 + 3]);
                    normals.push(vertexData[k * 6 + 4]);
                    normals.push(vertexData[k * 6 + 5]);
                }

                xktModel.createGeometry({
                    geometryId: geometryId,
                    primitiveType: "triangles",
                    positions: positions,
                    normals: normals,
                    indices: indices
                });
            }

            const meshId = ("mesh" + nextId++);

            xktModel.createMesh({
                meshId: meshId,
                geometryId: geometryId,
                matrix: new Float32Array(placedGeometry.flatTransformation),
                color: [placedGeometry.color.x, placedGeometry.color.y, placedGeometry.color.z],
                opacity: placedGeometry.color.w
            });

            meshIds.push(meshId);
        }

        xktModel.createEntity({
            entityId: entityId,
            meshIds: meshIds
        });
    }
}