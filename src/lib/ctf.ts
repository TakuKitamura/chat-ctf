
import { NextApiRequest } from "next";
import type { File } from "formidable";
const dotenv = require('dotenv')

export const validCheckEnv = (message: string, paramsName: string[]) => {
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

export const botResponse = async (
    req: NextApiRequest,
    roomID: number,
    message: string,
    file: File | undefined
) => {
    try {
        const botHandler = (await import(`./bots/bot${roomID}`)).default;
        return await botHandler({
            req,
            message,
            file
        });
    } catch (err) {
        console.error(`Error loading bot${roomID}:`, err);
        return { gotFlag: false, html: `<h3>Error loading bot #${roomID}</h3>` }
    }
}
