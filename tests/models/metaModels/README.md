These JSON files contain IFC metadata parsed using [xeokit-metadata](https://github.com/bimspot/xeokit-metadata).

We feed these files into ````ifc2xkt```` alongside the source IFC files. Then ````ifc2xkt```` sources IFC metadata from 
these files, while it sources geometry from the IFC files via ````web-ifc````.

These files will be redundant as soon as ````web-ifc```` is able to parse IFC properties in the IFC.