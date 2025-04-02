
import { NextApiRequest } from "next";
const dotenv = require('dotenv')
const escape = require('escape-html');
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
const fs = require("fs");
const JSZip = require('jszip');
import { XMLParser } from 'fast-xml-parser';

const jimp = require('jimp');

const invalidFormat = { gotFlag: false, html: '<h3>Invalid Format</h3>' }

const validCheckEnv = (message: string, paramsName: string[]) => {
    const config = dotenv.parse(Buffer.from(message))

    let isExistParam = true
    let retParams: { [key: string]: string } = {}
    for (let i = 0; i < paramsName.length; i++) {
        const paramName = paramsName[i];
        if ((paramName in config) === false) {
            isExistParam = false
            break
        }
        retParams[paramName] = config[paramName]
    }
    if (Object.keys(config).length !== paramsName.length || isExistParam === false) {
        return { valid: false, params: {} }
    }
    return { valid: true, params: retParams }
}

export const botResonse = async (validator: boolean, req: NextApiRequest, roomID: number, message: string, url: string, file: any) => {
    if (roomID === 1) {
        return ctf1(validator, req, message)
    } else if (roomID === 2) {
        const paramsData = validCheckEnv(message, ['search', 'n'])
        if (paramsData.valid === false) {
            return invalidFormat
        }
        return await ctf2(validator, { search: paramsData.params.search, n: paramsData.params.n })
    } else if (roomID === 3) {
        return await ctf3(validator, { message: message, file: file })
    } else if (roomID === 4) {
        const paramsData = validCheckEnv(message, ['n'])
        if (paramsData.valid === false) {
            return invalidFormat
        }
        return ctf4(validator, { req: req, n: paramsData.params.n, url: decodeURIComponent(url)})
    }  else if (roomID === 5) {
        return await ctf5(validator, { message: message, file: file})
    } else {
        return null
    }
}

const ctf1 = (validator: boolean, req: NextApiRequest, message: string) => {
    const UA = req.headers["user-agent"] || ''
    if (UA.includes('"')) {
        return { gotFlag: true, html: "<h1>正解！</h1>" }
    }

    if (message.length >= 100) {
        return {
            gotFlag: false,
            html: '[ERROR] message length is too long.'
        }
    }

    return {
        gotFlag: false,
        html: `The message you sent is, <br><b>'${escape(message)}'</b>. <input type="hidden" value="${escape(UA)}">`
    }
}

const ctf2 = async (validator: boolean, params: { search: string, n: string }) => {
    const search = params.search.toLowerCase()
    const n = params.n

    if (Number.isInteger(Number(n))) {
        if (Number(n) < 1 || Number(n) > 10) {
            return { gotFlag: false, html: 'Error: n must be an integer between 1 and 10' }
        }
    }

    if (n.includes("'")) {
        return { gotFlag: true, html: "<h1>正解！</h1>" }
    }

    if (Number.isInteger(Number(n)) === false) {
        return { gotFlag: false, html: `MySQL error:<br>'SELECT NAME FROM Artists name like '%${escape(params.search)}%' LIMIT '${escape(n)}';'<br>at db.ts:21:5` }
    }

    const db = await open(
        {
            filename: './chinook.db',
            driver: sqlite3.Database
        }
    );

    const artists = await db.all("select name from Artists where name like ? limit ?", `%${search}%`, n);
    if (artists.length === 0) {
        return {
            gotFlag: false,
            html: 'Not Match!'
        }
    }

    let resHtml = 'Artists Name Search<ul class="list">'
    for (let i = 0; i < artists.length; i++) {
        const artist: string = artists[i]['Name'].toLowerCase();
        const item = artist.replaceAll(search, `<span class="highlight">${escape(search)}</span>`)
        resHtml += `<li>${item}</li>`
    }
    resHtml += '</ul>'
    return {
        gotFlag: false,
        html: resHtml
    }
}

const ctf3 = async (validator: boolean, params: { message: string, file: any }) => {
    if (params.file === undefined) {
        return {
            gotFlag: false,
            html: "upload jpeg or png"
        }
    }
    const path = params.file.filepath
    const img = await jimp.read(path);
    const grayImg = await img.grayscale()
    const base64Data = await grayImg.getBase64Async(jimp.AUTO)

    const mimetype = params.file.mimetype

    const originalFileName = params.file.originalFilename

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

const ctf4 = (validator: boolean, params: { req: NextApiRequest, n: string, url: string }) => {
    if (Number.isInteger(Number(params.n)) === false) {
        return invalidFormat
    }

    const n = Number(params.n)

    if (n < 1 || n > 100) {
        if (params.url.includes('<') || params.url.includes('>')) {
            return { gotFlag: true, html: "<h1>正解！</h1>" }
        }
        return { gotFlag: false, html: `Error: n must be an integer between 1 and 100 <br>at ${escape(decodeURI(params.url))}` }
    }

    let result = ''
    for (let i = 1; i <= n; i++) {
        if (i % 15 === 0) {
            result += "FizzBuzz "
        } else if (i % 5 === 0) {
            result += "Buzz "
        } else if (i % 3 === 0) {
            result += "Fizz "
        } else {
            result += `${i} `
        }
    }

    return {
        gotFlag: false,
        html: result
    }
}

const ctf5 = async (validator: boolean, params: { message: string, file: any }) => {
    if (params.file === undefined) {
        return {
            gotFlag: false,
            html: "<a target='_blank' href='https://drive.google.com/drive/my-drive'>Google Drive</a>にアクセスし、適当なGoogleスプレッドシートを作成し、適当な文字列をどこでもいいので入力してください。そして、ファイル/ダウンロードから Microsoft Excelを選択しそれをアップロードしてください。何かをするとWebサーバが動作しているPC内のファイル(例えば、/etc/passwd)を取得できるかもしれません。"
        }
    }
    const path = params.file.filepath

    const mimetype = params.file.mimetype

    const originalFileName = params.file.originalFilename
    if (mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        return { gotFlag: false, html: `${escape(originalFileName)} is not .xlsx` }
    }

    const fileData = await fs.promises.readFile(path);

    const zip = await JSZip.loadAsync(fileData);

    const sharedStringsFile = zip.file('xl/sharedStrings.xml');

    const sharedStringsData = await sharedStringsFile.async('base64');

    const xmlData = Buffer.from(sharedStringsData, 'base64').toString()

    if (validator && xmlData.indexOf('<!DOCTYPE') !== -1 && xmlData.indexOf('<!ENTITY') !== -1 && xmlData.indexOf('SYSTEM') !== -1) {
        return { gotFlag: true, html: "<h1>正解！</h1>" }
    }

    const parser = new XMLParser();
    const jsonObj = parser.parse(xmlData);

    type SharedStringItem = {
        t: string;
    };

    type SST = {
        si: SharedStringItem[] | SharedStringItem;
        count?: string;
        uniqueCount?: string;
        xmlns?: string;
    };

    const sst: SST = jsonObj.sst;

    const uniqueCount = sst.uniqueCount || (Array.isArray(sst.si) ? sst.si.length : 1);

    const siArray: SharedStringItem[] = Array.isArray(sst.si) ? sst.si : [sst.si];

    const values = siArray.map((si) => si.t);

    let html = `Excelを解析した結果、以下のユニークな文字列が${escape(uniqueCount)}つ含まれているようです。<ul>`;
    for (const element of values) {
        html += `<li>${escape(element)}</li>`;
    }
    html += '</ul>';
    return {
        gotFlag: false,
        html: html
    }
}
