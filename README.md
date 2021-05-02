# ifc2xkt - An Experimental IFC→XKT Converter Using web-ifc

[![This project is using Percy.io for visual regression testing.](https://percy.io/static/images/percy-badge.svg)](https://percy.io/73524691/xeokit-ifc-to-xkt)
[![npm version](https://badge.fury.io/js/%40xeokit%2Fxeokit-ifc-to-xkt.svg)](https://badge.fury.io/js/%40xeokit%2Fxeokit-ifc-to-xkt)

[````ifc2xkt````](https://github.com/xeokit/xeokit-ifc-to-xkt) is an experimental CLI tool for Node.js that converts IFC
files into xeokit's native XKT geometry format.

The XKT format compresses huge double-precision models into a compact payload that can be rapidly loaded over the Web
into a xeokit viewer.

This experimental converter provides a one-step IFC→XKT conversion, using the experimental
WASM-based [````web-ifc````](https://github.com/tomvandig/web-ifc) library
from [tomvandig](https://github.com/tomvandig) to parse the IFC input,
and [xeokit-xkt-utils](https://github.com/xeokit/xeokit-xkt-utils) to generate the XKT output.

The converter is not perfect, and loses some transform precision with distantly-placed models. However, it runs quickly,
and despite losing some transform precision, seems able to convert distantly-placed models without losing geometry
precision.

![Schependomlaan](https://xeokit.github.io/xeokit-ifc-to-xkt/assets/Schependomlaan.png)

* [[View this XKT model](https://xeokit.github.io/xeokit-ifc-to-xkt/tests/loadXKT.html?xkt_src=models/xkt/Schependomlaan.xkt)]

# Usage

Clone the [repository](https://github.com/xeokit/xeokit-ifc-to-xkt) and install the converter. Note that we're
using ````git lfs clone```` so that we get some example IFC files to convert.

```bash
git lfs clone https://github.com/xeokit/xeokit-ifc-to-xkt.git
cd xeokit-ifc-to-xkt
npm install
```

Now you're ready to convert some IFC files.

To convert a file, run ````ifc2xkt````, specifying paths to the source IFC file and the target XKT file.

```bash
node ifc2xkt.js -s ./tests/models/ifc/Schependomlaan.ifc -o ./tests/models/xkt/Schependomlaan.xkt
```

Once you've got your XKT file, you can then view it with xeokit in the browser.

```bash
import {Viewer, XKTLoaderPlugin} from "../dist/xeokit-sdk.es.js";

const viewer = new Viewer({
    canvasId: "myCanvas"
});

const xktLoader = new XKTLoaderPlugin(viewer);

const model = xktLoader.load({
    id: "myModel",
    src: "./tests/models/xkt/Schependomlaan.xkt"
});
```

# Features

- Converts IFC 2x3 and 4 to XKT
- Runs in Node.js
- Fast conversion using WASM
- Direct IFC→XKT conversion without intermediate file formats
- Compact XKT output
- Double-precision geometry, enabling models to be viewed at their original site placement

# Architecture

As mentioned, [````ifc2xkt````](https://github.com/xeokit/xeokit-ifc-to-xkt) is built around two open source libraries:

* [````web-ifc````](https://github.com/tomvandig/web-ifc) - an MIT-licensed library
  from [tomvandig](https://github.com/tomvandig), which loads an IFC file into an in-memory document model that
  represents the IFC geometry content.
* [````xeokit-xkt-utils````](https://github.com/xeokit/xeokit-xkt-utils) - an AGPL3-licensed library from xeolabs that
  builds an in-memory XKT document model and saves it as an XKT file.

Using these two libraries together, [````ifc2xkt````](https://github.com/xeokit/xeokit-ifc-to-xkt) performs the
following steps:

1. loads an IFC into an in-memory IFC document model,
2. translates the IFC document model into an XKT document model, then
3. serializes the XKT document model to an XKT file.

# Examples

### Example 1: Basic Model

In this first example, we're converting an IFC 2x3 file to XKT. This model is centered at the IFC coordinate origin, and
therefore relies on single-precision geometry.

```bash
time node ifc2xkt.js -s Schependomlaan.ifc -o Schependomlaan.xkt

Reading IFC file: ifc/Schependomlaan.ifc
Wrote file
Loading: ifc/Schependomlaan.ifc
Read 
Loading 
Tape 44348356
Lines normal 714486
Max express ID 1080892
Loaded 714486 lines in 339 ms!
Array buffer size: 1040.375 kB

Writing XKT file: Schependomlaan.xkt

real    0m3.562s
user    0m4.752s
sys     0m0.241s
```

![Schependomlaan](https://xeokit.github.io/xeokit-ifc-to-xkt/assets/Schependomlaan.png)

* [[View this XKT model](https://xeokit.github.io/xeokit-ifc-to-xkt/tests/loadXKT.html?xkt_src=models/xkt/Schependomlaan.xkt)]

### Example 2: Double Precision Geometry

In this second example, we're converting an IFC 4 model which is placed at ````[1842022, 10, -5173301]````, and
consequently relies on double-precision geometry coordinates, because the coordinate values will be huge.

This model is of the Marc Antoine apartment building in Lyon, and was provided by BIMData.io.

```bash
time node ifc2xkt.js -s MAP.ifc -o MAP.xkt

Reading IFC file: ifc/MAP.ifc
Wrote file
Loading: ifc/MAP.ifc
Read 
Loading 
Tape 23548265
Lines normal 475783
Max express ID 833829
Loaded 475783 lines in 208 ms!
Array buffer size: 1342.054 kB

Writing XKT file: MAP.xkt

real    0m3.685s
user    0m4.889s
sys     0m0.173s
```

![MAP](https://xeokit.github.io/xeokit-ifc-to-xkt/assets/MAP.png)

* [[View this XKT model](https://xeokit.github.io/xeokit-ifc-to-xkt/tests/loadXKT.html?xkt_src=models/xkt/MAP.xkt)]

# Benchmarks

The table below shows benchmarks for ````ifc2xkt```` using various IFC2x3 and IFC4 files. Click "View" in the last
column to open each benchmark's converted XKT file in a xeokit viewer.

<table class="collection-content">
   <thead>
      <tr>
         <th>Model</th>
         <th>IFC Size</th>
         <th>XKT Size</th>
         <th>Objects</th>
         <th>Meshes</th>
         <th>Conversion Time</th>
         <th>View</th>
      </tr>
   </thead>
   <tbody>
      <tr id="20d35656-efe3-4c02-8cca-9b4bdc67a502">
         <td class="cell-title"><a href="http://openifcmodel.cs.auckland.ac.nz/Model/Details/316">Holter Tower</a></td>
         <td class="cell-xa}R">169.12M</td>
         <td class="cell-}&gt;pG">6.26M</td>
         <td class="cell-:YKF">121100</td>
         <td class="cell-efRZ">89546</td>
         <td class="cell-Snov">46.37s</td>
         <td class="cell-Y&gt;`W"><a href="https://xeokit.github.io/xeokit-ifc-to-xkt/tests/loadXKT.html?xkt_src=models/xkt/dataHolter.xkt">View</a></td>
      </tr>
      <tr id="e2e4c3c8-9e74-45d0-9de3-41dd7cae42fc">
         <td class="cell-title"><a href="http://openifcmodel.cs.auckland.ac.nz/Model/Details/301">Conference Center</a></td>
         <td class="cell-xa}R">71.70M</td>
         <td class="cell-}&gt;pG">3.99M</td>
         <td class="cell-:YKF">12174</td>
         <td class="cell-efRZ">5323</td>
         <td class="cell-Snov">9.5s</td>
         <td class="cell-Y&gt;`W"><a href="https://xeokit.github.io/xeokit-ifc-to-xkt/tests/loadXKT.html?xkt_src=models/xkt/confCenter.xkt">View</a></td>
      </tr>
      <tr id="c119aadc-21ac-4401-ad62-4881e1910c95">
         <td class="cell-title"><a href="https://github.com/openBIMstandards/Archive-DataSetSchependomlaan">Schependomlaan</a></td>
         <td class="cell-xa}R">49.28M</td>
         <td class="cell-}&gt;pG">1.04M</td>
         <td class="cell-:YKF">7270</td>
         <td class="cell-efRZ">4761</td>
         <td class="cell-Snov">3.5s</td>
         <td class="cell-Y&gt;`W"><a href="https://xeokit.github.io/xeokit-ifc-to-xkt/tests/loadXKT.html?xkt_src=models/xkt/MAP.xkt">View</a></td>
      </tr>
      <tr id="014bafb4-9f02-4459-b68c-dfb1aadfae11">
         <td class="cell-title"><a href="https://bimdata.io">MAP (double precision)</a></td>
         <td class="cell-xa}R">29.35M</td>
         <td class="cell-}&gt;pG">1.3M</td>
         <td class="cell-:YKF">3548</td>
         <td class="cell-efRZ">3680</td>
         <td class="cell-Snov">3.6s</td>
         <td class="cell-Y&gt;`W"><a href="https://xeokit.github.io/xeokit-ifc-to-xkt/tests/loadXKT.html?xkt_src=models/xkt/MAP.xkt">View</a></td>
      </tr>
      <tr id="b168254f-9751-47b4-9bf4-541eef5aac99">
         <td class="cell-title"><a href="https://github.com/aothms/IfcOpenHouse">IfcOpenHouse2x3</a></td>
         <td class="cell-xa}R">0.11M</td>
         <td class="cell-}&gt;pG">0.01M</td>
         <td class="cell-:YKF">80</td>
         <td class="cell-efRZ">18</td>
         <td class="cell-Snov">0.28s</td>
         <td class="cell-Y&gt;`W"><a href="https://xeokit.github.io/xeokit-ifc-to-xkt/tests/loadXKT.html?xkt_src=models/xkt/IfcOpenHouse2x3.xkt">View</a></td>
      </tr>
      <tr id="3f0162ea-10a1-447b-953d-31e36234e547">
         <td class="cell-title"><a href="https://github.com/aothms/IfcOpenHouse">IfcOpenHouse4</a></td>
         <td class="cell-xa}R">0.11M</td>
         <td class="cell-}&gt;pG">0.01M</td>
         <td class="cell-:YKF">80</td>
         <td class="cell-efRZ">18</td>
         <td class="cell-Snov">0.21s</td>
         <td class="cell-Y&gt;`W"><a href="https://xeokit.github.io/xeokit-ifc-to-xkt/tests/loadXKT.html?xkt_src=models/xkt/IfcOpenHouse4.xkt">View</a></td>
      </tr>
   </tbody>
</table>

### Issues found in benchmarks

- Holter Tower has missing objects
- MAP has misaligned objects
- Some colors are incorrect

# Visual Tests

We're using visual testing on Percy to catch bugs in ````ifc2xkt````.

See the latest test reports
here: [https://percy.io/73524691/xeokit-ifc-to-xkt](https://percy.io/73524691/xeokit-ifc-to-xkt)

![Percy](https://xeokit.github.io/xeokit-ifc-to-xkt/assets/percy.png)

# Further Work

* Debug the transform precision loss in ````web-ifc````.
* Support point clouds, line segments etc.
* Somehow configure rollup.js to build a CJS binary that bundles ````web-ifc.wasm````.