import { NextApiRequest, NextApiHandler } from "next";
import { NextApiResponseServerIO } from "types/next";
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

import { getIronSession } from 'iron-session';
import { sessionOptions, IronSessionData } from 'lib/session'
import { botResponse } from 'lib/ctf'

import { Fields, Files, File } from "formidable";
import formidable, { IncomingForm } from "formidable";
import { file } from "jszip";

const escape = require('escape-html');
const dotenv = require('dotenv')

export const config = {
  api: {
    bodyParser: false,
  },
};

async function chatRoute(req: NextApiRequest, res: NextApiResponseServerIO) {
  const session = await getIronSession<IronSessionData>(req, res, sessionOptions);
  const userID = session.user.userID
  const iconURL = session.user.iconURL
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

    const allChat = await db.all('SELECT message, Chat.userID, User.iconURL FROM Chat LEFT JOIN ( SELECT userID, iconURL FROM User) AS User ON Chat.userID = User.userID  WHERE (roomID = ?) AND ((Chat.userID != "bot") or (Chat.userID = "bot" and sendto = ?))', roomID, userID);

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

    const form = formidable(options);
    await form.parse(req, async (err: Error | null, fields: Fields, files: Files) => {
      if (err) {
        console.error('Form Parse Error')
        res.status(400).json({ "status": "ng" });
        return
      }

      if (userID === 'Admin' && files.File === undefined) {
        if (fields.message &&
            (fields.message as unknown as string) === '/reset-chat') {
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

      if (files.File !== undefined && files.File.length !== 1) {
        console.error('FileList length is not 1')
        res.status(400).json({ "status": "ng" });
        return
      }

      // get message
      let message = ''
      if (files.File !== undefined) {
        const oneFile = files.File[0]
        message = `📁 ${oneFile.originalFilename}\nMime Type: ${oneFile.mimetype}\nSize: ${oneFile.size} bytes`
      } else {
        message = String(fields.message)
      }

      if (message.length > 1000) {
        res.status(400).json({ "status": "ng" });
        return
      }

      const result = await botResponse(req, roomID, message, files.File ? files.File[0] : undefined)

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

      await db.all('insert into Chat (userID, sendto, roomID, message) values (?, ?, ?, ?)', userID, userID, roomID, message);

      res?.socket?.server?.io?.emit("public_message", [{ userID: userID, iconURL: iconURL, roomID: roomID, message: message }]); // file

      await db.all('insert into Chat (userID, sendto, roomID, message) values (?, ?, ?, ?)', 'bot', userID, roomID, result.html);

      res?.socket?.server?.io?.emit(userID, [{ userID: 'bot', iconURL: '/1f916.png', roomID: roomID, message: result.html }]);

      res.status(200).json({ "status": "ok" });
    })
  }
};
export default chatRoute;
