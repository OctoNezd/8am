const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
module.exports = {
    entry: "./js/sharaga.js",
    output: {
        filename: "sharaga-bundle.[contenthash].js",
        path: path.resolve(__dirname, "dist"),
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.html$/i,
                loader: "html-loader",
            },
        ],
    },
    devtool: "source-map",
    plugins: [
        new HtmlWebpackPlugin({
            template: "template.html",
            title: "Ш А Р А Г А",
        }),
    ],
    resolve: {
        modules: [
            path.resolve(__dirname, "node_modules"),
            path.resolve(__dirname, "./"),
            path.resolve(__dirname, "./src"),
        ],
    },
};
