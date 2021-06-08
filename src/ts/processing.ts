

class Processing {
    private readonly canvas: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;

    private static readonly MIN_DISPLACEMENT_ALLOWED = 10;

    public constructor() {
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
    }

    public detectBasePeriod(image: HTMLImageElement): number {
        this.canvas.width = image.width;
        this.canvas.height = image.height;
        this.context.drawImage(image, 0, 0);
        const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

        const MAX_TESTED_LINES_COUNT = 50;
        const computeTestedLines = (): number[] => {
            const result: number[] = [];
            const delta = (imageData.height < MAX_TESTED_LINES_COUNT) ? 1 : (imageData.height / MAX_TESTED_LINES_COUNT);
            for (let i = 0; i < imageData.height; i += delta) {
                result.push(Math.floor(i));
            }
            return result;
        };

        const testedLines = computeTestedLines();

        const MAX_DISPLACEMENT_ALLOWED = imageData.width / 3;

        const differences = []; // displacement=0 is considered as unavailable so set a high value for it

        for (let displacement = Processing.MIN_DISPLACEMENT_ALLOWED; displacement <= MAX_DISPLACEMENT_ALLOWED; displacement++) {
            let totalDifference = 0;
            for (const iY of testedLines) {
                for (let iX = displacement; iX < imageData.width; iX++) {
                    const baseIndex = 4 * (iX + iY * imageData.width);
                    const targetIndex = baseIndex - 4 * displacement;

                    const dRed = imageData.data[baseIndex] - imageData.data[targetIndex];
                    const dGreen = imageData.data[baseIndex + 1] - imageData.data[targetIndex + 1];
                    const dBlue = imageData.data[baseIndex + 2] - imageData.data[targetIndex + 2];

                    const difference = (Math.abs(dRed) + Math.abs(dGreen) + Math.abs(dBlue)) / 3;
                    totalDifference += difference;
                }
            }

            const nbPixels = (testedLines.length * (imageData.width - displacement));
            const averageDifference = totalDifference / nbPixels;
            differences.push(averageDifference);
        }

        const bestDisplacement = this.computeBestDisplacement(differences) + Processing.MIN_DISPLACEMENT_ALLOWED;
        return bestDisplacement;
    }

    private computeBestDisplacement(differences: number[]): number {
        // when reaching the correct delta, on most stereograms the total difference is at its lowest, and goes right up just after
        // so try to detect this point
        let highestGradientIndex = 1;
        let highestGradient = -1;
        for (let i = 2; i < differences.length - 1; i++) {
            const gradient = differences[i + 1] - differences[i];

            // console.log(`${i + Processing.MIN_DISPLACEMENT_ALLOWED}:\t${differences[i]}\t${gradient}`);
            if (gradient > highestGradient) {
                highestGradientIndex = i;
                highestGradient = gradient;
            }
        }

        // The gradient helps determine the end of the lowest plateau.
        // Once found, check what was just before because maybe it was better
        for (let i = 0; i < 3; i++) {
            if (highestGradientIndex > 0 && differences[highestGradientIndex - 1] < differences[highestGradientIndex]) {
                highestGradientIndex--;
            }
        }
        return highestGradientIndex;
    }
}

export {
    Processing,
};
