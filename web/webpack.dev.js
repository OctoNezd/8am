const { merge } = require("webpack-merge");

const common = require("./webpack.common.js");
const devapi = "http://localhost:8000";

module.exports = merge(common, {
    mode: "development",

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
