import * as fs from "fs";
import * as fse from "fs-extra";
import * as path from "path";
import { DemopageEmpty } from "webpage-templates";

const data = {
    title: "Stereogram solver",
    description: "Stereogram (aka Magic Eye) solver for those who can't see them",
    introduction: [
        "An autostereogram (also known as Magic Eye) is a 2D image designed to create the illusion of 3D. In each image, there is a 3D object that can only be viewed by looking at the image a certain way, as if the screen was transparent and you looked at the wall behind it.",
        "Correctly viewing a Magic Eye definitely takes some practice, and some people are completely unable to see them. This website is a tool to reveal the 3D scene hidden in a stereogram by revealing its silhouette. It works for most of autosterograms, especially if they have a simple plane as background."
    ],
    githubProjectName: "stereogram-solver",
    additionalLinks: [
        { href: "https://piellardj.github.io/stereogram-webgl/", text: "See my Magic Eye generator here." },
    ],
    scriptFiles: [
        "script/main.min.js"
    ],
    cssFiles: [
        "css/main.css"
    ],
    body: "<div id=\"contents\">\n<div id=\"errors\" class=\"contents-section\"><noscript>You need to enable Javascript to run this experiment.</noscript></div></div>"
};

const SRC_DIR = path.resolve(__dirname);
const DEST_DIR = path.resolve(__dirname, "..", "docs");

const buildResult = DemopageEmpty.build(data, DEST_DIR);

// disable linting on this file because it is generated
buildResult.pageScriptDeclaration = "/* tslint:disable */\n" + buildResult.pageScriptDeclaration;

const SCRIPT_DECLARATION_FILEPATH = path.join(SRC_DIR, "ts", "page-interface-generated.ts");
fs.writeFileSync(SCRIPT_DECLARATION_FILEPATH, buildResult.pageScriptDeclaration);

fse.copySync(path.join(SRC_DIR, "static"), DEST_DIR);
