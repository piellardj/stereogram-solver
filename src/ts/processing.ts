

class Processing {
    public readonly container: HTMLElement;
    private readonly range: HTMLInputElement;

    private readonly canvas: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;

    private imageData: ImageData;
    private processedGrid: ImageData;

    public constructor() {
        this.container = document.createElement("div");

        this.range = document.createElement("input");
        this.range.type = "range";
        this.range.min = "1";
        this.range.max = "100";
        this.range.value = "1";
        this.range.step = "1";
        this.range.addEventListener("change", () => {
            this.process();
        });
        this.container.appendChild(this.range);

        this.canvas = document.createElement("canvas");
        this.container.appendChild(this.canvas);

        this.context = this.canvas.getContext("2d");
    }

    public set image(image: HTMLImageElement) {
        this.canvas.width = image.width;
        this.canvas.height = image.height;
        this.context.drawImage(image, 0, 0);
        this.imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

        this.processedGrid = this.context.createImageData(this.imageData.width, this.imageData.height);

        this.process();
    }

    public detectBasePeriod(): number {
        const MAX_TESTED_LINES_COUNT = 50;
        const computeTestedLines = (): number[] => {
            const result: number[] = [];
            const delta = (this.imageData.height < MAX_TESTED_LINES_COUNT) ? 1 : (this.imageData.height / MAX_TESTED_LINES_COUNT);
            for (let i = 0; i < this.imageData.height; i += delta) {
                result.push(Math.floor(i));
            }
            return result;
        };

        const testedLines = computeTestedLines();

        const maxPeriodAllowed = this.imageData.width / 3;

        const differences = [255]; // displacement=0 is considered as unavailable so set a high value for it

        for (let displacement = 1; displacement <= maxPeriodAllowed; displacement++) {
            let totalDifference = 0;
            for (const iY of testedLines) {
                for (let iX = displacement; iX < this.imageData.width; iX++) {
                    const baseIndex = 4 * (iX + iY * this.imageData.width);
                    const targetIndex = baseIndex - 4 * displacement;

                    const dRed = this.imageData.data[baseIndex] - this.imageData.data[targetIndex];
                    const dGreen = this.imageData.data[baseIndex + 1] - this.imageData.data[targetIndex + 1];
                    const dBlue = this.imageData.data[baseIndex + 2] - this.imageData.data[targetIndex + 2];

                    const difference = (Math.abs(dRed) + Math.abs(dGreen) + Math.abs(dBlue)) / 3;
                    totalDifference += difference;
                }
            }

            const nbPixels = (testedLines.length * (this.imageData.width - displacement));
            const averageDifference = totalDifference / nbPixels;
            differences.push(averageDifference);
        }

        const bestDisplacement = this.computeBestDisplacement(differences);
        // console.log(`${bestDisplacement}\t:\t${this.imageData.width / bestDisplacement}`);
        return bestDisplacement;
    }

    private computeBestDisplacement(differences: number[]): number {
        // when reaching the correct delta, on most stereograms the total difference is at its lowest, and goes right up just after
        // so try to detect this point
        let highestGradientIndex = 1;
        let highestGradient = -1;
        for (let i = 2; i < differences.length - 1; i++) {
            const gradient = differences[i + 1] - differences[i];

            // console.log(`${i}: ${gradient}`);
            if (gradient > highestGradient) {
                highestGradientIndex = i;
                highestGradient = gradient;
            }
        }

        let lowestGradientIndex = 1;
        let lowestGradient = 99999999;
        for (let i = 2; i < highestGradientIndex; i++) {
            const gradient = differences[i + 1] - differences[i];

            if (gradient < lowestGradient) {
                lowestGradientIndex = i;
                lowestGradient = gradient;
            }
        }

        if (lowestGradient >= 0 || lowestGradientIndex < highestGradientIndex - 2) { // data is incoherent, trust the highest gradient
            return highestGradientIndex;
        } else { // data is consistent, try to find a precise value
            const x = Math.abs(lowestGradient) / (Math.abs(lowestGradient) + highestGradient);
            return x * lowestGradientIndex + (1 - x) * highestGradientIndex;
        }
    }

    private process(): void {
        return;
        const maxDelta = +this.range.value;
        console.log("Process: " + maxDelta);

        // reset
        for (let i = 0; i < this.processedGrid.data.length; i++) {
            this.processedGrid.data[i] = 255;
        }

        // compute
        for (let delta = 1; delta <= maxDelta; delta++) {
            // const delta = 40;
            let maxDifference = 0;

            const differences: number[] = [];

            // reset
            for (let i = 0; i < this.processedGrid.data.length; i++) {
                this.processedGrid.data[i] = 255;
            }

            for (let iY = 0; iY < this.imageData.height; iY++) {
                for (let iX = delta; iX < this.imageData.width; iX++) {
                    const baseIndex = 4 * (iX + iY * this.imageData.width);
                    const targetIndex = baseIndex - 4 * delta;

                    const dRed = this.imageData.data[baseIndex] - this.imageData.data[targetIndex];
                    const dGreen = this.imageData.data[baseIndex + 1] - this.imageData.data[targetIndex + 1];
                    const dBlue = this.imageData.data[baseIndex + 2] - this.imageData.data[targetIndex + 2];

                    const difference = (Math.abs(dRed) + Math.abs(dGreen) + Math.abs(dBlue)) / 3;
                    // const difference = Math.sqrt(dRed * dRed + dGreen * dGreen + dBlue * dBlue);

                    if (difference < this.processedGrid.data[baseIndex]) {
                        this.processedGrid.data[baseIndex + 0] = difference;
                        this.processedGrid.data[baseIndex + 1] = difference;// 5 * delta;
                        this.processedGrid.data[baseIndex + 2] = difference;
                    }

                    differences.push(this.processedGrid.data[baseIndex + 0]);
                    maxDifference = Math.max(maxDifference, this.processedGrid.data[baseIndex + 0]);
                }
            }

            this.computeStats(delta, differences);
        }

        this.context.putImageData(this.processedGrid, 0, 0);
    }

    private computeStats(delta: number, collection: number[]): void {
        let total = 0;
        let max = -1;
        let min = 500000;

        for (const n of collection) {
            total += n;
            if (max < n) { max = n; }
            if (min > n) { min = n; }
        }

        const average = total / collection.length;

        let squareDifference = 0;
        for (const n of collection) {
            const difference = n - average;
            squareDifference += difference * difference;
        }

        const standardDeviation = squareDifference / collection.length;

        console.log(`Delta: ${delta};\tmin: ${min};\n max: ${max};\naverage: ${average};\n stddeviation: ${standardDeviation}`);
    }
}

export {
    Processing,
};
