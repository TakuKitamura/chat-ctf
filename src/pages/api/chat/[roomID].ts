import { NextApiRequest, NextApiHandler } from "next";
import { NextApiResponseServerIO } from "types/next";
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions } from 'lib/session'
import { botResonse } from 'lib/ctf'
import { Files } from "formidable";

const escape = require('escape-html');
const dotenv = require('dotenv')
const formidable = require("formidable");

let validator = true

export const config = {
  api: {
    bodyParser: false,
  },
};

async function chatRoute(req: NextApiRequest, res: NextApiResponseServerIO) {
  const userID = req.session.user.userID
  const iconURL = req.session.user.iconURL
  let roomID: number = Number(req.query.roomID)

  if (Number.isInteger(roomID) && roomID > 0) {
    roomID = Number(req.query.roomID)
  } else {
    console.log('invalid roomID')
    res.status(400).json({ "status": "ng" });
    return
  }


  if (req.method === "GET") {
    const db = await open(
      {
        filename: './mydb.sqlite',
        driver: sqlite3.Database
      }
    );

    let allChat
    if (validator) {
      allChat = await db.all('SELECT message, Chat.userID, User.iconURL FROM Chat LEFT JOIN ( SELECT userID, iconURL FROM User) AS User ON Chat.userID = User.userID  WHERE (roomID = ?) AND ((Chat.userID != "bot") or (Chat.userID = "bot" and sendto = ?))', roomID, userID);
    } else {
      allChat = await db.all('SELECT message, Chat.userID, User.iconURL FROM Chat LEFT JOIN ( SELECT userID, iconURL FROM User) AS User ON Chat.userID = User.userID  WHERE (roomID = ?) AND ((Chat.userID != "bot") or (Chat.userID = "bot"))', roomID);
    }

    res.json({ "userID": userID, "allChat": allChat });

  } else if (req.method === "POST") {

    const isEmpty = (obj: object) => {
      return !Object.keys(obj).length;
    }

    if (userID === 'bot') {
      res.status(400).json({ "status": "ng" });
      return
    }

    const options = {
      maxFiles: 1,
      maxFileSize: 1024 * 1024 // 1MB,
    };

    const form = new formidable.IncomingForm(options);
    await form.parse(req, async function (err: Error, fields: { message: string, url: string }, files: any) {
      const isFile = isEmpty(fields)
      if (userID === 'Admin' && isFile === false) {
        if (fields.message === '/reset-chat') {
          const db = await open(
            {
              filename: './mydb.sqlite',
              driver: sqlite3.Database
            }
          );

          await db.run('delete from chat');

          res?.socket?.server?.io?.emit("got_flag", `${userID?.toString().toUpperCase()} reset chat`);
          res.status(200).json({ "status": "ok" });
          return
        }
      }

      const file = files.File
      if (err) {
        res.status(400).json({ "status": "ng" });
        return
      }

      // get message
      const message = isFile ? `📁 ${file.originalFilename}\nMime Type: ${file.mimetype}\nSize: ${file.size} bytes` : String(fields.message)

      if (message.length > 1000) {
        res.status(400).json({ "status": "ng" });
        return
      }

      const result = await botResonse(validator, req, roomID, message, fields.url, file)

      if (result === null) {
        res.status(400).json({ "status": "ng" });
        return
      }

      const db = await open(
        {
          filename: './mydb.sqlite',
          driver: sqlite3.Database
        }
      );


      if (result.gotFlag) {
        // await db.all('insert into Chat (userID, sendto, roomID, message) values (?, ?, ?, ?)', 'bot', userID, roomID, "解説");

        res?.socket?.server?.io?.emit(String(userID), [{ userID: 'bot', iconURL: '/1f916.png', roomID: roomID, message: result.html }]);

        res?.socket?.server?.io?.emit("got_flag", `${userID?.toString().toUpperCase()} Captured #${roomID} 🚩`);
        res.status(200).json({ "status": "ok" });
        return
      }

      const botResponse = result.html

      await db.all('insert into Chat (userID, sendto, roomID, message) values (?, ?, ?, ?)', userID, userID, roomID, message);

      res?.socket?.server?.io?.emit("public_message", [{ userID: userID, iconURL: iconURL, roomID: roomID, message: message }]); // file

      await db.all('insert into Chat (userID, sendto, roomID, message) values (?, ?, ?, ?)', 'bot', userID, roomID, botResponse);

      if (validator) {
        res?.socket?.server?.io?.emit(userID, [{ userID: 'bot', iconURL: '/1f916.png', roomID: roomID, message: botResponse }]);
      } else {
        res?.socket?.server?.io?.emit("public_message", [{ userID: 'bot', iconURL: '/1f916.png', roomID: roomID, message: botResponse }]);
      }

      res.status(200).json({ "status": "ok" });
    })
  }
};
export default withIronSessionApiRoute(chatRoute as NextApiHandler, sessionOptions)
