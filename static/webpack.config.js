module.exports = {
    entry: "./js/sharaga.js",
    output: {
        filename: "sharaga-bundle.js",
        path: __dirname,
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    devtool: "source-map",
};
