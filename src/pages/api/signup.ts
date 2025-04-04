import { NextApiRequest, NextApiResponse } from "next";
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const bcrypt = require("bcrypt")

async function hashPassword(plaintextPassword:string) {
    const hash: string = await bcrypt.hash(plaintextPassword, 10);
    return hash
}

export default async function signupRoute(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const signUpData = req.body;

        const userID = String(signUpData.userID)

        const userIDRegex = /^[a-zA-Z0-9_]{3,15}$/g;
        if (userID.match(userIDRegex) === null) {
            res.status(400).json({ "message": "User Name is invalid" });
            return
        }

        const password = String(signUpData.password)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/g;
        if (password.match(passwordRegex) === null) {
            res.status(400).json({ "message": "Password is Invalid" });
            return
        }

        const iconURL = String(signUpData.iconURL)

        let url
        try {
            url = new URL(iconURL)
        } catch {
            res.status(400).json({ "message": "Icon URL is invalid" });
            return
        }
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            res.status(400).json({ "message": "Icon URL is invalid" });
            return
        }

        const db = await open(
            {
                filename: './mydb.sqlite',
                driver: sqlite3.Database
            }
        );

        if (userID === 'bot') {
            res.status(400).json({ "message": `User ${userID} is already registered` });
            return
        }

        const countUser = await db.all('select count(userID) from User where userID = ?', userID);
        if (Number(countUser[0]['count(userID)']) > 0) {
            res.status(400).json({ "message": `User ${userID} is already registered` });
            return
        }

        const passwordHash:string = await hashPassword(password)

        db.all('insert into User (userID, password, iconURL) values (?, ?, ?)', userID, passwordHash, iconURL);


        res.status(200).json({ "message": "ok" });
    }
};
