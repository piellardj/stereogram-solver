type Observer = () => unknown;

class InputImage {
    public readonly onChangeObservers: Observer[] = [];

    public readonly container: HTMLElement;
    private readonly fileInput: HTMLInputElement;

    private loadedImage: HTMLImageElement;

    public constructor() {
        this.container = document.createElement("div");

        this.fileInput = document.createElement("input");
        this.fileInput.type = "file";
        this.fileInput.accept = ".png,.jpg,.bmp,.webp";
        this.fileInput.addEventListener("change", (event: Event) => {
            event.stopPropagation();
            const files = this.fileInput.files;
            if (files.length === 1) {
                // this.labelSpanElement.innerText = FileUpload.truncate(files[0].name);

                const reader = new FileReader();
                reader.onload = () => {
                    const image = new Image();
                    image.addEventListener("load", () => {
                        this.loadedImage = image;
                        this.callObservers();
                    });
                    image.src = reader.result as string;
                };
                reader.readAsDataURL(files[0]);
            }
        }, false);
        this.container.appendChild(this.fileInput);

        const startingImage = new Image();
        startingImage.addEventListener("load", () => {
            if (!this.loadedImage) {
                this.loadedImage = startingImage;
                this.callObservers();
            }
        });
        startingImage.src = "resources/images/thumbsup.jpg";
    }

    public get image(): HTMLImageElement {
        return this.loadedImage;
    }

    private callObservers(): void {
        for (const observer of this.onChangeObservers) {
            observer();
        }
    }
}

export {
    InputImage,
};
