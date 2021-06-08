import { InputImage } from "./input-image";
import { Processing } from "./processing";
import { Visualization } from "./visualization";


const container = document.getElementById("contents");

const inputImage = new InputImage();
const visualization = new Visualization();
const processing = new Processing();

container.appendChild(inputImage.container);
container.appendChild(visualization.container);

let rawImage: HTMLImageElement;
const sourceImageSection = document.createElement("section");
{
    sourceImageSection.classList.add("contents-section");
    const description = document.createElement("div");
    description.textContent = "Source image:";
    sourceImageSection.appendChild(description);
    sourceImageSection.appendChild(description);
    container.appendChild(sourceImageSection);
}

function onNewImage(): void {
    const image = inputImage.image;
    if (image) {
        visualization.image = image;
        visualization.displacement = processing.detectBasePeriod(image);

        if (rawImage) {
            rawImage.parentElement.removeChild(rawImage);
        }
        rawImage = image;
        rawImage.style.maxWidth = "100%";
        sourceImageSection.appendChild(rawImage);
    }
}

inputImage.onChangeObservers.push(onNewImage);
onNewImage();
