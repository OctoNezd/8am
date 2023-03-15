import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { ViteFaviconsPlugin } from 'vite-plugin-favicon'
import { gitDescribeSync } from 'git-describe'
const devapi = 'http://127.0.0.1:8000'
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        ViteFaviconsPlugin({
            logo: './src/assets/icons/main_icon.png',
            devMode: 'webapp',
            mode: 'webapp',
            favicons: {
                orientation: 'portrait',
                maskable: true,
                appName: 'Ш А Р А Г А',
                appDescription: 'Веб-Приложение для просмотра расписания шараги',
                developerURL: null, // prevent retrieving from the nearest package.json
                background: '#201a18',
                theme_color: '#201a18',
                manifestMaskable: './src/assets/icons/maskable.png',
                icons: {
                    favicons: false
                },
                files: {
                    android: {
                        manifestFileName: 'manifest.json'
                    }
                }
            }
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        proxy: {
            '/stats': devapi,
            '/group': devapi,
            '/groups': devapi,
            '/teacher': devapi,
            '/teachers': devapi,
            '/sources': devapi
        }
    },
    define: {
        __APP_VER__: JSON.stringify(
            gitDescribeSync(__dirname, { dirtyMark: '' }).toString().replace('-dirty', '')
        )
    }
})

