const HtmlWebpackPlugin = require("html-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const webpack = require("webpack");
const path = require("path");
const WebpackBar = require("webpackbar");

let commitHash = require("child_process")
    .execSync("git rev-parse --short HEAD")
    .toString()
    .trim();
module.exports = {
    entry: "./js/entry.js",
    output: {
        filename: "[name].[contenthash].js",
        path: path.resolve(__dirname, "dist"),
        clean: true,
        publicPath: "/",
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
    plugins: [
        new WebpackBar(),
        new HtmlWebpackPlugin({
            template: "html/template.html",
            title: "Ш А Р А Г А",
        }),
        new FaviconsWebpackPlugin({
            logo: "./icons/favicon.png",
            devMode: "webapp",
            mode: "webapp",
            favicons: {
                orientation: "portrait",
                maskable: true,
                appName: "Ш А Р А Г А",
                appDescription: "Ш А Р А Г А",
                developerURL: null, // prevent retrieving from the nearest package.json
                background: "#ffffff",
                theme_color: "#303030",
            },
        }),
        new WorkboxPlugin.GenerateSW({
            // these options encourage the ServiceWorkers to get in there fast
            // and not allow any straggling "old" SWs to hang around
            clientsClaim: true,
            skipWaiting: true,
        }),
        new webpack.DefinePlugin({
            __COMMIT_HASH__: JSON.stringify(commitHash),
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
