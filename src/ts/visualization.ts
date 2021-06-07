class Visualization {
    private readonly canvasElement: HTMLCanvasElement;
    private readonly canvasContext: CanvasRenderingContext2D;

    private _displacement: number = 1;
    private _image: HTMLImageElement;

    public constructor() {
        this.canvasElement = document.createElement("canvas");
        this.canvasElement.width = 100;
        this.canvasElement.height = 100;

        this.canvasContext = this.canvasElement.getContext("2d");

        window.addEventListener("resize", () => { this.updateCssSize(); });
    }

    public get container(): HTMLElement {
        return this.canvasElement;
    }

    public set image(image: HTMLImageElement) {
        this._image = image;

        this.canvasElement.width = this._image.width;
        this.canvasElement.height = this._image.height;
        this.updateCssSize();
        this.update();
    }

    public set displacement(displacement: number) {
        this._displacement = displacement;
        this.update();
    }

    private update(): void {
        if (this._image) {
            this.canvasContext.globalCompositeOperation = "source-over";
            this.canvasContext.drawImage(this._image, 0, 0, this.canvasElement.width, this.canvasElement.height);
            this.canvasContext.globalCompositeOperation = "difference";
            this.canvasContext.drawImage(this._image, this._displacement, 0, this.canvasElement.width, this.canvasElement.height);
        }
    }

    private updateCssSize(): void {
        this.canvasElement.style.maxWidth = `${this._image.width}px`;

        const internalAspectRatio = this.canvasElement.width / this.canvasElement.height;

        const currentCanvasWidth = this.canvasElement.getBoundingClientRect().width;
        const idealCanvasHeight = Math.ceil(currentCanvasWidth / internalAspectRatio);
        this.canvasElement.style.height = `${idealCanvasHeight}px`;
    }
}

export {
    Visualization,
};
