import { BotHandlerArgs } from './types';
const escape = require('escape-html');
const jimp = require('jimp');

export default async function ({
    req,
    message,
    file
}: BotHandlerArgs) {
    if (file === undefined) {
        return {
            gotFlag: false,
            html: "upload jpeg or png"
        }
    }
    const path = file.filepath
    const img = await jimp.read(path);
    const grayImg = await img.grayscale()
    const base64Data = await grayImg.getBase64Async(jimp.AUTO)

    const mimetype = file.mimetype

    const originalFileName = file.originalFilename || ''

    if (mimetype != 'image/jpeg' && mimetype != 'image/png') {
        return { gotFlag: false, html: `${escape(originalFileName)} is not jpeg or png` }
    }

    if (originalFileName.includes("`") || originalFileName.includes(";") || originalFileName.includes("|") || originalFileName.includes("&") || originalFileName.includes("(") || originalFileName.includes(")")) {
        return { gotFlag: true, html: "<h1>正解！</h1>" }
    }

    if (originalFileName.split(' ').length > 1) {
        const stderr = `convert-im6.q16: unable to open image \`${escape(originalFileName.split(' ')[0])}': No such file or directory @ error/blob.c/OpenBlob/2924.\nconvert-im6.q16: no decode delegate for this image format \`' @ error/constitute.c/ReadImage/575.\``
        return { gotFlag: false, html: stderr }
    }

    return {
        gotFlag: false,
        html: `<img src="${base64Data}" />`
    }
}
