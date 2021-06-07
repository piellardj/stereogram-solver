import { InputImage } from "./input-image";
import { Visualization } from "./visualization";


const container = document.getElementById("contents");

const inputImage = new InputImage();
container.appendChild(inputImage.container);

const displacementRange = document.createElement("input");
displacementRange.type = "range";
displacementRange.min = "0";
displacementRange.max = "100";
displacementRange.step = "1";
displacementRange.value = "1";
container.appendChild(displacementRange);

const visualization = new Visualization();
container.appendChild(visualization.container);

function onNewDisplacement(): void {
    visualization.displacement = +displacementRange.value;
}
displacementRange.addEventListener("input", onNewDisplacement);
displacementRange.addEventListener("change", onNewDisplacement);
onNewDisplacement();


function onNewImage(): void {
    const image = inputImage.image;
    if (image) {
        container.style.maxWidth = `${image.width}px`;
        displacementRange.max = image.width.toFixed(0);
        visualization.image = image;
    }
}

inputImage.onChangeObservers.push(onNewImage);
onNewImage();
