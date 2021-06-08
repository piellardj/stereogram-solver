function setCompositingError(): void {
    const id = "COMPOSITING_ERROR";

    if (!document.getElementById(id)) {
        const errorsSection = document.getElementById("errors");
        const div = document.createElement("div");
        div.id = id;
        div.textContent = "Your browser does not support the 'difference' globalCompositeOperation. This project will not run as expected.";
        errorsSection.appendChild(div);
    }

}

class Visualization {
    public readonly container: HTMLElement;

    private readonly displacementRange: HTMLInputElement;
    private readonly canvasElement: HTMLCanvasElement;
    private readonly canvasContext: CanvasRenderingContext2D;

    private readonly textOutputImageSize: HTMLSpanElement;
    private readonly textOuputDisplacement: HTMLSpanElement;

    private _displacement: number = 1;
    private _image: HTMLImageElement;

    public constructor() {
        this.container = document.createElement("section");
        this.container.classList.add("contents-section");

        {
            const textOutputContainer = document.createElement("div");

            const imageSize = document.createElement("div");
            imageSize.appendChild(document.createTextNode("Image size: "));
            this.textOutputImageSize = document.createElement("span");
            imageSize.appendChild(this.textOutputImageSize);
            textOutputContainer.appendChild(imageSize);

            const displacement = document.createElement("div");
            displacement.appendChild(document.createTextNode("Displacement: "));
            this.textOuputDisplacement = document.createElement("span");
            displacement.appendChild(this.textOuputDisplacement);
            textOutputContainer.appendChild(displacement);

            this.container.appendChild(textOutputContainer);
        }

        {
            this.displacementRange = document.createElement("input");
            this.displacementRange.classList.add("full-width-range");
            this.displacementRange.type = "range";
            this.displacementRange.min = "0";
            this.displacementRange.max = "100";
            this.displacementRange.step = "1";
            this.displacementRange.value = "1";
            const onNewDisplacement = () => {
                this.displacement = +this.displacementRange.value;
            };
            this.displacementRange.addEventListener("change", onNewDisplacement);
            this.displacementRange.addEventListener("input", onNewDisplacement);
            this.container.appendChild(this.displacementRange);
        }

        this.canvasElement = document.createElement("canvas");
        this.canvasElement.style.maxWidth = "100%";
        this.canvasElement.width = 100;
        this.canvasElement.height = 100;
        this.container.appendChild(this.canvasElement);

        this.canvasContext = this.canvasElement.getContext("2d");
    }

    public set image(image: HTMLImageElement) {
        this._image = image;

        this.canvasElement.width = this._image.width;
        this.canvasElement.height = this._image.height;

        this.displacementRange.max = this.canvasElement.width.toFixed(0);

        this.textOutputImageSize.textContent = `${this._image.width}x${this._image.height}`;

        this.update();
    }

    public set displacement(displacement: number) {
        this._displacement = displacement;
        this.displacementRange.value = displacement.toFixed(0);

        this.textOuputDisplacement.textContent = `${displacement.toFixed(0)}px`;
        this.update();
    }

    private update(): void {
        if (this._image) {
            this.canvasContext.globalCompositeOperation = "source-over";
            this.canvasContext.drawImage(this._image, 0, 0, this.canvasElement.width, this.canvasElement.height);

            if (this._displacement > 0) {
                this.canvasContext.globalCompositeOperation = "difference";
                if (this.canvasContext.globalCompositeOperation !== "difference") {
                    setCompositingError();
                }

                this.canvasContext.drawImage(this._image, this._displacement, 0, this.canvasElement.width, this.canvasElement.height);
            }
        }
    }
}

export {
    Visualization,
};
