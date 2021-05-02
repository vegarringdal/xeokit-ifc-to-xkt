#!/usr/bin/env node

const commander = require('commander');
const package = require('./package.json');
const {convertIFCFileToXKT} = require("./src/convertIFCFileToXKT.js");

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
    console.error('\n\nError: please specify target XKT path.');
    program.help();
    process.exit(1);
}

async function main() {
    console.log('\n\nReading IFC file: ' + program.source);
    console.log('\n\nWriting XKT file: ' + program.output);
    await convertIFCFileToXKT(program.source, program.output);
}

main().catch(err => {
    console.error('Something went wrong:', err);
    process.exit(1);
});

