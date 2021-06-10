import "./page-interface-generated.ts"


function setFailedToLoadError(url: string | null): void {
    const id = "IMAGE_FAILED_TO_LOAD";

    let div = document.getElementById(id);
    if (!div) {
        const errorsSection = document.getElementById("errors");
        div = document.createElement("div");
        div.id = id;
        errorsSection.appendChild(div);
    }

    if (url === null) {
        div.style.display = "none";
    } else {
        div.style.display = "";
        div.textContent = `Failed to load image from url: '${url}'.`;
    }
}

type Observer = () => unknown;

interface ISelectOption {
    value: string;
    label: string;
}

const SELECT_DEFAULT_VALUE = "";

function buildSelect(options: ISelectOption[]): HTMLSelectElement {
    function buildOption(value: string, label: string): HTMLOptionElement {
        const option = document.createElement("option");
        option.value = value;
        option.label = label;
        return option;
    }

    const select = document.createElement("select");
    const defaultOption = buildOption(SELECT_DEFAULT_VALUE, "Choose a preset");
    defaultOption.disabled = true;
    defaultOption.hidden = true;
    select.appendChild(defaultOption);
    for (const option of options) {
        select.appendChild(buildOption(option.value, option.label));
    }

    return select;
}

class InputImage {
    public readonly onChangeObservers: Observer[] = [];

    public readonly container: HTMLElement;

    private readonly presetSelect: HTMLSelectElement;
    private readonly uploadFileButton: HTMLInputElement;
    private readonly urlInput: HTMLInputElement;
    private readonly urlLoadButton: HTMLButtonElement;

    private loadedImage: HTMLImageElement;

    public constructor() {
        this.container = document.createElement("section");
        this.container.id = "input-section";
        this.container.classList.add("contents-section");

        {
            this.presetSelect = buildSelect([
                { value: "shark.jpg", label: "Shark" },
                { value: "thumbsup.jpg", label: "Thumbs up" },
                { value: "planet.jpg", label: "Planet" },
                { value: "dolphins.jpg", label: "Dolphins" },
                { value: "atomium.jpg", label: "Atomium" },
            ]);
            this.presetSelect.id = "preset-select";
            this.presetSelect.addEventListener("change", () => { this.onPresetChange(); });

            const presetContainer = document.createElement("div");
            presetContainer.classList.add("input-row");
            const presetLabel = document.createElement("label");
            presetLabel.htmlFor = this.presetSelect.id;
            presetLabel.textContent = "Choose a preset: ";

            presetContainer.appendChild(presetLabel);
            presetContainer.appendChild(this.presetSelect);

            this.container.appendChild(presetContainer);
        }

        {
            this.uploadFileButton = document.createElement("input");
            this.uploadFileButton.id = "image-upload";

            const fileInputContainer = document.createElement("div");
            fileInputContainer.classList.add("input-row");
            const label = document.createElement("label");
            label.htmlFor = this.uploadFileButton.id;
            label.textContent = "Choose from your computer: ";
            fileInputContainer.appendChild(label);

            this.uploadFileButton.type = "file";
            this.uploadFileButton.accept = ".png,.jpg,.bmp,.webp";
            this.uploadFileButton.addEventListener("change", (event: Event) => {
                event.stopPropagation();
                const files = this.uploadFileButton.files;
                if (files.length === 1) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const image = new Image();
                        image.addEventListener("load", () => {
                            this.loadedImage = image;
                            this.presetSelect.value = SELECT_DEFAULT_VALUE;
                            this.callObservers();
                        });
                        image.src = reader.result as string;
                    };
                    reader.readAsDataURL(files[0]);
                }
            }, false);

            fileInputContainer.appendChild(this.uploadFileButton);
            this.container.appendChild(fileInputContainer);
        }

        {
            this.urlInput = document.createElement("input");
            this.urlInput.id = "url-input";

            const urlInputContainer = document.createElement("div");
            urlInputContainer.classList.add("input-row");
            const label = document.createElement("label");
            label.htmlFor = this.urlInput.id;
            label.textContent = "Choose from the Internet: ";
            urlInputContainer.appendChild(label);

            const inputContainer = document.createElement("div");
            this.urlInput.type = "text";
            this.urlInput.placeholder = "Image url...";
            inputContainer.appendChild(this.urlInput);

            this.urlLoadButton = document.createElement("button");
            this.urlLoadButton.textContent = "Load from URL";
            inputContainer.appendChild(this.urlLoadButton);

            this.urlLoadButton.addEventListener("click", () => {
                this.loadCrossOriginImage(this.urlInput.value);
                this.presetSelect.value = SELECT_DEFAULT_VALUE;
                this.uploadFileButton.value = "";
            })

            urlInputContainer.appendChild(inputContainer);
            this.container.appendChild(urlInputContainer);
        }

        this.onPresetChange();
    }

    public get image(): HTMLImageElement {
        return this.loadedImage;
    }

    private onPresetChange(): void {
        const preset = this.presetSelect.value;
        if (preset) {
            const url = `resources/images/${preset}?v=${Page.version}`;
            this.loadImage(url);
            this.uploadFileButton.value = "";
        }
    }

    private loadImage(url: string): void {
        const startingImage = new Image();
        startingImage.addEventListener("load", () => {
            setFailedToLoadError(null);

            this.loadedImage = startingImage;
            this.callObservers();
        });
        startingImage.addEventListener("error", () => {
            setFailedToLoadError(url);
        });
        startingImage.src = url;
    }

    private loadCrossOriginImage(url: string): void {
        // Loading and manipulating a cross origin image is tricky
        // because canvas2d APIs such as getImageData() are blocked when the canvas is tainted by a cross origin image

        // use XMLHttpRequest and not Image directly because I ant to set custom headers
        const xhr = new XMLHttpRequest();
        xhr.addEventListener("load", () => {
            const reader = new FileReader();
            reader.addEventListener("loadend", () => {
                // pass a data url because it does not contain information that the data is cross-origin
                // so the canvas won't be tainted
                this.loadImage(reader.result.toString());
            });
            reader.readAsDataURL(xhr.response);
        });

        // use a proxy that allows all cross origin
        xhr.open('GET', `https://cors-anywhere.herokuapp.com/${url}`);
        // set this header because the proxy requires it
        xhr.setRequestHeader("X-Request-URL", "null");

        // request data in the data-url form so that it can be later parsed as an image
        xhr.responseType = 'blob';
        xhr.send();
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
