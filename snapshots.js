const PercyScript = require('@percy/script');
const httpServer = require('http-server');
const {convertIFCFileToXKT} = require("./src/convertIFCFileToXKT.js");

//---------------------------------------------------------------------------------
// For each test IFC model:
//  - convert IFC to XKT
//  - load XKT into xeokit and verify that it looks OK
//---------------------------------------------------------------------------------

PercyScript.run(async (page, percySnapshot) => {

    async function testPage(pageName) {
        await page.goto('http://localhost:3000/tests/' + pageName);
        await page.waitForFunction(() => !!document.querySelector('#percyLoaded'));
        await percySnapshot(pageName, {
            widths: [1280]
        });
    }

    console.log(`Converting models`);

    const models = [
        "IfcOpenHouse2x3",
        "IfcOpenHouse4",
        "Schependomlaan",
        "MAP",
        "confCenter"
    ];

    console.log(`Running visual tests`);

    let server = httpServer.createServer();
    server.listen(3000);

    console.log(`Server started`);

    for (let i = 0, len = models.length; i < len; i++) {

        const modelId = models[i];
        const ifcPath = "./tests/models/ifc/" + modelId + ".ifc";
        const xktPath = "./tests/models/xkt/" + modelId + ".xkt";

        await convertIFCFileToXKT(ifcPath, xktPath);

        await testPage("loadXKT.html?xkt_src=models/xkt/" + modelId + ".xkt");
    }

    server.close();
});

