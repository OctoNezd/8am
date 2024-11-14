import {
    argbFromHex,
    hexFromArgb,
    themeFromSourceColor,
    sourceColorFromImage,
    CorePalette
} from '@material/material-color-utilities'
function setSchemeProperties(target, scheme, suffix = '') {
    for (const [key, value] of Object.entries(scheme.toJSON())) {
        const token = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
        console.log('setting token', token)
        const color = hexFromArgb(value)
        target.style.setProperty(`--md-sys-color-${token}${suffix}`, color)
    }
}
export function loadLSTheme() {
    console.log(CorePalette)
    let userThemeColor = localStorage.getItem('userTheme')
    if (userThemeColor === null) {
        userThemeColor = "#ffd05a"
    }
    if (userThemeColor.startsWith('#')) {
        userThemeColor = argbFromHex(userThemeColor)
    }
    const userTheme = themeFromSourceColor(userThemeColor)
    // applyTheme(userTheme, { target: document.body, brightnessSuffix: true })
    setSchemeProperties(document.body, userTheme.schemes.dark, '-dark')
    setSchemeProperties(document.body, userTheme.schemes.light, '-light')
    // Check if the user has dark mode turned on
    console.log('ut:', userTheme)
    console.log('palette:', userTheme.palettes)
    for (const [key, palette] of Object.entries(userTheme.palettes)) {
        const paletteKey = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
        for (let tone = 0; tone < 100; tone += 5) {
            const token = `--md-ref-palette-${paletteKey}-${tone}`.replace('variant-', 'variant')
            const color = hexFromArgb(palette.tone(tone))
            console.log(token, color)
            document.body.style.setProperty(token, color)
        }
    }
    // Apply the theme to the body by updating custom properties for material tokens
}
export function makeThemeFromImg() {
    var input = document.createElement('input')
    input.type = 'file'
    input.setAttribute('accept', 'image/*')

    input.onchange = async (e) => {
        var file = e.target.files[0]
        console.log('onchange', file)
        const bmp = await createImageBitmap(file, {
            resizeHeight: 300,
            resizeQuality: 'low'
        })
        console.log('bmp:', bmp)
        // create a canvas
        const canvas = document.createElement('canvas')
        // resize it to the size of our ImageBitmap
        canvas.width = bmp.width
        canvas.height = bmp.height
        // get a bitmaprenderer context
        const ctx = canvas.getContext('bitmaprenderer')
        ctx.transferFromImageBitmap(bmp)
        // get it back as a Blob
        const blob2 = await new Promise((res) => canvas.toBlob(res))
        console.log(blob2) // Blob
        const imgel = document.createElement('img')
        imgel.src = URL.createObjectURL(blob2)
        console.log('imgel', imgel)
        const theme = await sourceColorFromImage(imgel)
        console.log('theme from image:', theme)
        localStorage.setItem('userTheme', JSON.stringify(theme))
        loadLSTheme()
    }

    input.click()
}
