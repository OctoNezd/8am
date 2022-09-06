const HtmlWebpackPlugin = require("html-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const webpack = require("webpack");
const path = require("path");
const WebpackBar = require("webpackbar");
const CopyPlugin = require("copy-webpack-plugin");

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
            logo: "./icons/main_icon.png",
            devMode: "webapp",
            mode: "webapp",
            manifest: {
                screenshots: [
                    {
                        src: "screenshot1.png",
                        sizes: "1080x2400",
                        type: "image/png",
                        platform: "narrow",
                        label: "Домашняя страница",
                    },
                    {
                        src: "screenshot2.png",
                        sizes: "1080x2400",
                        type: "image/png",
                        platform: "narrow",
                        label: "Настройки",
                    },
                    {
                        src: "pc.jpg",
                        sizes: "480x360",
                        type: "image/jpeg",
                        platform: "narrow",
                        label: "2pacaliveinserbia",
                    },
                ],
            },
            favicons: {
                orientation: "portrait",
                maskable: true,
                appName: "Ш А Р А Г А",
                appDescription:
                    "Веб-Приложение для просмотра расписания шараги",
                developerURL: null, // prevent retrieving from the nearest package.json
                background: "#ffffff",
                theme_color: "#303030",
                manifestMaskable: "./icons/maskable.png",
                icons: {
                    favicons: false,
                },
                files: {
                    android: {
                        manifestFileName: "manifest.json",
                    },
                },
            },
        }),
        new FaviconsWebpackPlugin({
            logo: "./icons/favicon.png",
            devMode: "light",
            mode: "light",
            favicons: {
                icons: {
                    android: false,
                    appleIcon: false,
                    appleStartup: false,
                    favicons: true,
                    windows: false,
                    yandex: false,
                },
            },
        }),
        new CopyPlugin({
            patterns: [{ from: "assets", to: "assets" }],
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
