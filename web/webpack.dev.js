const { merge } = require("webpack-merge");

const common = require("./webpack.common.js");
const webpack = require("webpack");

const devapi = "http://127.0.0.1:8000";

module.exports = merge(common, {
    mode: "development",
    plugins: [
        new webpack.DefinePlugin({
            __IS_DEV__: JSON.stringify(true),
        }),
    ],
    devServer: {
        hot: true,
        proxy: {
            "/stats": devapi,
            "/groups": devapi,
            "/group": devapi,
        },
        client: {
            overlay: {
                warnings: false,
            },
            progress: true,
        },
        port: 8080,
    },
    devtool: "source-map",
});
