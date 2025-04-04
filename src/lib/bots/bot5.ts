import { BotHandlerArgs } from './types';
import { XMLParser } from 'fast-xml-parser';
const escape = require('escape-html');
const fs = require("fs");
const JSZip = require('jszip');

export default async function bot({
    req,
    message,
    file
}: BotHandlerArgs) {
    if (file === undefined) {
        return {
            gotFlag: false,
            html: "<a target='_blank' href='https://drive.google.com/drive/my-drive'>Google Drive</a>にアクセスし、適当なGoogleスプレッドシートを作成し、適当な文字列をどこでもいいので入力してください。そして、ファイル/ダウンロードから Microsoft Excelを選択しそれをアップロードしてください。何かをするとWebサーバが動作しているPC内のファイル(例えば、/etc/passwd)を取得できるかもしれません。"
        }
    }
    const path = file.filepath

    const mimetype = file.mimetype

    const originalFileName = file.originalFilename
    if (mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        return { gotFlag: false, html: `${escape(originalFileName)} is not .xlsx` }
    }

    const fileData = await fs.promises.readFile(path);

    const zip = await JSZip.loadAsync(fileData);

    const sharedStringsFile = zip.file('xl/sharedStrings.xml');

    const sharedStringsData = await sharedStringsFile.async('base64');

    const xmlData = Buffer.from(sharedStringsData, 'base64').toString()

    if (xmlData.indexOf('<!DOCTYPE') !== -1 && xmlData.indexOf('<!ENTITY') !== -1 && xmlData.indexOf('SYSTEM') !== -1) {
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
