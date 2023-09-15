/** @type {import('postcss-load-config').Config} */
const config = {
    plugins: [
        require('css-prefers-color-scheme')
    ]
}
  
module.exports = config