import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { gitDescribeSync } from 'git-describe'
const devapi = 'http://127.0.0.1:8000'
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        VitePWA({
            mode: 'development',
            strategies: 'injectManifest',
            srcDir: 'src',
            filename: 'sw.js',
            injectManifest: {
                maximumFileSizeToCacheInBytes: 3000000
            },
            manifest: {
                name: 'Ш А Р А Г А',
                short_name: 'ШАРАГА',
                lang: 'ru',
                description: 'Веб-Приложение для просмотра расписания шараги',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            },
            devOptions: {
                enabled: true,
                type: 'module',
                navigateFallback: 'index.html'
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

