const PercyScript = require('@percy/script');
const httpServer = require('http-server');
const {convertIFCFileToXKT} = require("./src/convertIFCFileToXKT.js");
const fs = require('fs');
const {convertIFCFileAndMetaModelToXKT} = require("./src/convertIFCFileAndMetaModelToXKT.js");

//---------------------------------------------------------------------------------
// For each test IFC model:
//  - convert IFC to XKT
//  - load XKT into xeokit and verify that it looks OK
//  - save conversion stats in ./testStats.json
//---------------------------------------------------------------------------------

PercyScript.run(async (page, percySnapshot) => {

    function parseHrtimeToSeconds(hrtime) {
        const seconds = (hrtime[0] + (hrtime[1] / 1e9)).toFixed(3);
        return seconds;
    }

    async function testPage(pageName) {
        await page.goto('http://localhost:3000/tests/' + pageName);
        await page.waitForFunction(() => !!document.querySelector('#percyLoaded'));
        await percySnapshot(pageName, {
            widths: [1280]
        });
    }

    const tests = [
        {
            ifcPath: "./tests/models/ifc/IfcOpenHouse2x3.ifc",
            //metaModelPath: "./tests/models/metaModels/IfcOpenHouse2x3.json",
            xktPath: "./tests/models/xkt/IfcOpenHouse2x3.xkt"
        },
        {
            ifcPath: "./tests/models/ifc/IfcOpenHouse4.ifc",
            //metaModelPath: "./tests/models/metaModels/IfcOpenHouse4.json",
            xktPath: "./tests/models/xkt/IfcOpenHouse4.xkt"
        },
        {
            ifcPath: "./tests/models/ifc/Schependomlaan.ifc",
            metaModelPath: "./tests/models/metaModels/Schependomlaan.json",
            xktPath: "./tests/models/xkt/Schependomlaan.xkt"
        },
        {
            ifcPath: "./tests/models/ifc/MAP.ifc",
            metaModelPath: "./tests/models/metaModels/MAP.json",
            xktPath: "./tests/models/xkt/MAP.xkt"
        },
        {
            ifcPath: "./tests/models/ifc/OTCConferenceCenter.ifc",
            metaModelPath: "./tests/models/metaModels/OTCConferenceCenter.json",
            xktPath: "./tests/models/xkt/OTCConferenceCenter.xkt"
        },
        {
            ifcPath: "./tests/models/ifc/HolterTower.ifc",
            metaModelPath: "./tests/models/metaModels/HolterTower.json",
            xktPath: "./tests/models/xkt/HolterTower.xkt"
        },
        {
            ifcPath: "./tests/models/ifc/rac_advanced_sample_project.ifc",
            metaModelPath: "./tests/models/metaModels/rac_advanced_sample_project.json",
            xktPath: "./tests/models/xkt/rac_advanced_sample_project.xkt"
        },
        {
            ifcPath: "./tests/models/ifc/rme_advanced_sample_project.ifc",
            metaModelPath: "./tests/models/metaModels/rme_advanced_sample_project.json",
            xktPath: "./tests/models/xkt/rme_advanced_sample_project.xkt"
        }
    ];

    let server = httpServer.createServer();
    server.listen(3000);

    console.log(`Server started`);

    const testStats = {
        tests: {}
    };

    for (let i = 0, len = tests.length; i < len; i++) {

        const test = tests[i];
        const startTime = process.hrtime();
        const modelStats = {};

        if (test.metaModelPath) {
            await convertIFCFileAndMetaModelToXKT(test.ifcPath, test.metaModelPath, test.xktPath, modelStats);
        } else {
            await convertIFCFileToXKT(test.ifcPath, test.xktPath, modelStats);
        }

        const elapsedSeconds = parseHrtimeToSeconds(process.hrtime(startTime));

        modelStats.modelId = test.ifcPath;
        modelStats.conversionTimeSecs = elapsedSeconds;

        await testPage("loadXKT.html?xkt_src=../" + test.xktPath);

        testStats.tests[test.ifcPath] = modelStats;
    }

    server.close();

    fs.writeFileSync('testStats.json', JSON.stringify(testStats, null, 2));
});

