const PercyScript = require('@percy/script');
const httpServer = require('http-server');
const {convertIFCFileToXKT} = require("./src/convertIFCFileToXKT.js");
const fs = require('fs');

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

    const models = [
        "IfcOpenHouse2x3",
        "IfcOpenHouse4",
        "Schependomlaan",
        "MAP",
        "confCenter",
        "dataHolter"
    ];

    let server = httpServer.createServer();
    server.listen(3000);

    console.log(`Server started`);

    const testStats = {
        models: {}
    };

    for (let i = 0, len = models.length; i < len; i++) {

        const modelId = models[i];
        const ifcPath = "./tests/models/ifc/" + modelId + ".ifc";
        const xktPath = "./tests/models/xkt/" + modelId + ".xkt";

        const startTime = process.hrtime();
        const modelStats = {};
        await convertIFCFileToXKT(ifcPath, xktPath, modelStats);
        const elapsedSeconds = parseHrtimeToSeconds(process.hrtime(startTime));

        modelStats.modelId = modelId;
        modelStats.conversionTimeSecs = elapsedSeconds;
        
        await testPage("loadXKT.html?xkt_src=models/xkt/" + modelId + ".xkt");

        testStats.models[modelId] = modelStats;
    }

    server.close();

    fs.writeFileSync('testStats.json', JSON.stringify(testStats, null, 2));
});

