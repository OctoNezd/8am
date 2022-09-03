const HtmlWebpackPlugin = require("html-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");
var WebpackPwaManifest = require("webpack-pwa-manifest");
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
            favicon: "./icons/favicon.png",
        }),
        new WorkboxPlugin.GenerateSW({
            // these options encourage the ServiceWorkers to get in there fast
            // and not allow any straggling "old" SWs to hang around
            clientsClaim: true,
            skipWaiting: true,
        }),
        new WebpackPwaManifest({
            publicPath: "/",
            name: "Ш А Р А Г А",
            short_name: "Ш А Р А Г А",
            description:
                "Генератор ICS файлов и альтернативный интерфейс расписания",
            background_color: "#ffffff",
            crossorigin: "use-credentials", //can be null, use-credentials or anonymous
            icons: [
                {
                    src: path.resolve("icons/favicon.png"),
                    sizes: [96, 128, 192, 256, 384, 512], // multiple sizes
                },
            ],
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
