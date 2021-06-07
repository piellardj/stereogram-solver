const path = require("path");

const PROJECT_DIR = path.resolve(__dirname, "..", "..");

module.exports = {
    devtool: "source-map",
    mode: "production",
    entry: path.join(PROJECT_DIR, "src", "ts", "main.ts"),
    output: {
        filename: "main.min.js",
        path: path.join(PROJECT_DIR, "docs", "script")
    },
	target: ["web", "es5"],
    resolve: {
        extensions: [".ts"]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            //   transpileOnly: true,
                            compilerOptions: {
                                rootDir: path.join(PROJECT_DIR, "src", "ts")
                            },
                            configFile: path.join(PROJECT_DIR, "src", "config", 'tsconfig.json')
                        }
                    }
                ],
            }
        ]
    }
}
