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
    entry: { main: "./js/entry.js" },
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
                test: /\.svg$/i,
                type: "asset/inline",
            },
            {
                test: /\.html$/i,
                loader: "html-loader",
                options: {
                    sources: {
                        list: [
                            "...",
                            {
                                tag: "lottie-player",
                                attribute: "src",
                                type: "src",
                            },
                        ],
                    },
                },
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: "asset/resource",
            },
            {
                test: /\.m?js$/,
                type: "javascript/auto",
            },
            {
                test: /\.m?js$/,
                resolve: {
                    fullySpecified: false,
                },
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
                        src: "pc.png",
                        sizes: "480x360",
                        type: "image/png",
                        platform: "narrow",
                        label: "2pacaliveinserbia",
                    },
                    {
                        src: "pc.png",
                        sizes: "480x360",
                        type: "image/png",
                        platform: "wide",
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
                background: "#201a18",
                theme_color: "#201a18",
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
        new WorkboxPlugin.InjectManifest({
            // these options encourage the ServiceWorkers to get in there fast
            // and not allow any straggling "old" SWs to hang around
            // clientsClaim: true,
            // skipWaiting: true,
            // ignoreURLParametersMatching: [/\/((?:\?|&|;)([^=]+)=([^&|;]+))?$/],
            exclude: ["assets"],
            swSrc: "./js/worker.js",
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
        alias: {
            "~": path.resolve(__dirname, "node_modules"),
        },
    },
};
