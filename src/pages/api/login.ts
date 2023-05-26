// import { NextApiRequest } from "next";
// import { NextApiResponseServerIO } from "types/next";
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const escape = require('escape-html');
const dotenv = require('dotenv')

import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions } from '../../lib/session'
import { NextApiRequest, NextApiResponse } from 'next'
const bcrypt = require("bcrypt")

async function comparePassword(plaintextPassword: string, hash:string) {
    const result: boolean = await bcrypt.compare(plaintextPassword, hash);
    return result;
}

async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const loginData = req.body;

        const userID = String(loginData.userID)
        if (userID === 'bot') {
            res.status(403).json({ "message": "Login Failed" });
            return
        }

        const password = String(loginData.password)

        const db = await open(
            {
                filename: './mydb.sqlite',
                driver: sqlite3.Database
            }
        );

        const countUser = await db.all('select count(userID), password, iconURL from User where userID = ?', userID);
        if (Number(countUser[0]['count(userID)']) !== 1) {
            res.status(403).json({ "message": "Login Failed" });
            return
        }

        const validPassword = await comparePassword(password, String(countUser[0]['password']))
        if (validPassword) {
            const user = { userID: userID, iconURL: String(countUser[0]['iconURL']) }
            req.session.user = user
            await req.session.save()
            res.status(200).json({ "message": "ok" });
            return
        } else {
            res.status(403).json({ "message": "Login Failed" });
            return
        }
    }
};

export default withIronSessionApiRoute(loginRoute, sessionOptions)