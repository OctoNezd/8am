const { merge } = require("webpack-merge");

const common = require("./webpack.common.js");
const WebpackBar = require("webpackbar");

const devapi = "http://localhost:8000";

module.exports = merge(common, {
    mode: "development",
    plugins: [new WebpackBar()],
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
