import * as fs from "fs";
import * as fse from "fs-extra";
import * as path from "path";
import { DemopageEmpty } from "webpage-templates";

const data = {
    title: "Stereogram solver",
    description: "Stereogram (aka Magic Eye) solver for those who can't see them",
    introduction: [
        "INTRODUCTION",
    ],
    githubProjectName: "stereogram-solver",
    additionalLinks: [],
    scriptFiles: [
        "script/main.min.js"
    ],
    cssFiles: [
        "css/main.css"
    ],
    body: "<noscript>You need to enable Javascript to run this experiment.</noscript>\n<div id=\"contents\"></div>"
};

const SRC_DIR = path.resolve(__dirname);
const DEST_DIR = path.resolve(__dirname, "..", "docs");

const buildResult = DemopageEmpty.build(data, DEST_DIR);

// disable linting on this file because it is generated
buildResult.pageScriptDeclaration = "/* tslint:disable */\n" + buildResult.pageScriptDeclaration;

const SCRIPT_DECLARATION_FILEPATH = path.join(SRC_DIR, "ts", "page-interface-generated.ts");
fs.writeFileSync(SCRIPT_DECLARATION_FILEPATH, buildResult.pageScriptDeclaration);

fse.copySync(path.join(SRC_DIR, "static"), DEST_DIR);
