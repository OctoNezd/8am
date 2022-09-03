const HtmlWebpackPlugin = require("html-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
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
        new FaviconsWebpackPlugin({
            logo: "./icons/favicon.png",
            favicons: {
                appName: "Ш А Р А Г А",
                appDescription: "Ш А Р А Г А",
                developerURL: null, // prevent retrieving from the nearest package.json
                background: "#fff",
                theme_color: "#303",
            },
        }),
        new WorkboxPlugin.GenerateSW({
            // these options encourage the ServiceWorkers to get in there fast
            // and not allow any straggling "old" SWs to hang around
            clientsClaim: true,
            skipWaiting: true,
        }),
    ],
    resolve: {
        modules: [
            path.resolve(__dirname, "node_modules"),
            path.resolve(__dirname, "./"),
            path.resolve(__dirname, "./src"),
        ],
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
            }),
        ],
    },
};
