const escape = require('escape-html');
import { BotHandlerArgs } from './types';

export default async function ({
    req,
    message,
    file
}: BotHandlerArgs) {
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
