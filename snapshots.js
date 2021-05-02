const PercyScript = require('@percy/script');
const httpServer = require('http-server');
const {convertIFCFileToXKT} = require("./src/convertIFCFileToXKT.js");

PercyScript.run(async (page, percySnapshot) => {

    async function testPage(pageName) {
        await page.goto('http://localhost:3000/tests/' + pageName);
        await page.waitForFunction(() => !!document.querySelector('#percyLoaded'));
        await percySnapshot(pageName, {
            widths: [1280]
        });
    }

    console.log(`Converting models`);

    await convertIFCFileToXKT("./tests/models/ifc/IfcOpenHouse2x3.ifc", "./tests/models/xkt/IfcOpenHouse2x3.xkt");
    await convertIFCFileToXKT("./tests/models/ifc/IfcOpenHouse4.ifc", "./tests/models/xkt/IfcOpenHouse4.xkt");
    await convertIFCFileToXKT("./tests/models/ifc/Schependomlaan.ifc", "./tests/models/xkt/Schependomlaan.xkt");
    await convertIFCFileToXKT("./tests/models/ifc/MAP.ifc", "./tests/models/xkt/MAP.xkt");
    await convertIFCFileToXKT("./tests/models/ifc/confCenter.ifc", "./tests/models/xkt/confCenter.xkt");

    console.log(`Running visual tests`);

    let server = httpServer.createServer();
    server.listen(3000);

    console.log(`Server started`);

    await testPage('convert_IFC_Schependomlaan.html');
    await testPage('convert_IFC_doublePrecision_MAP.html');

    server.close();
});

