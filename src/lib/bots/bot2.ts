import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { validCheckEnv } from 'lib/ctf';
import { BotHandlerArgs } from './types';
const escape = require('escape-html');
const invalidFormat = { gotFlag: false, html: '<h3>Invalid Format</h3>' };

export default async function ({
    req,
    message,
    file
}: BotHandlerArgs) {
    const paramsData = validCheckEnv(message, ['search', 'n'])
    if (paramsData.valid === false) {
        return invalidFormat
    }

    const search = paramsData.params.search.toLowerCase()
    const n = paramsData.params.n

    if (Number.isInteger(Number(n))) {
        if (Number(n) < 1 || Number(n) > 10) {
            return { gotFlag: false, html: 'Error: n must be an integer between 1 and 10' }
        }
    }

    if (n.includes("'")) {
        return { gotFlag: true, html: "<h1>正解！</h1>" }
    }

    if (Number.isInteger(Number(n)) === false) {
        return { gotFlag: false, html: `MySQL error:<br>'SELECT NAME FROM Artists name like '%${escape(paramsData.params.search)}%' LIMIT '${escape(n)}';'<br>at db.ts:21:5` }
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
