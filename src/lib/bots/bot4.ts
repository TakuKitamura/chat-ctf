import { validCheckEnv } from 'lib/ctf';
import { BotHandlerArgs } from './types';
const escape = require('escape-html');
const invalidFormat = { gotFlag: false, html: '<h3>Invalid Format</h3>' };
const invalidReferer = { gotFlag: false, html: '<h3>Invalid Referer</h3>' };

export default async function ({
    req,
    message,
    file
}: BotHandlerArgs) {
    const paramsData = validCheckEnv(message, ['n'])
    if (paramsData.valid === false) {
        return invalidFormat
    }

    if (Number.isInteger(Number(paramsData.params.n)) === false) {
        return invalidFormat
    }

    const n = Number(paramsData.params.n)

    // FIXME: It is not appropriate to get the URL from the referer
    const referer = req.headers.referer
    if (!referer) {
        return invalidReferer
    }
    const decodedURL = decodeURIComponent(referer)

    if (n < 1 || n > 100) {
        if (decodedURL.includes('<') || decodedURL.includes('>')) {
            return { gotFlag: true, html: "<h1>正解！</h1>" }
        }
        return { gotFlag: false, html: `Error: n must be an integer between 1 and 100 <br>at ${escape(decodeURI(decodedURL))}` }
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
