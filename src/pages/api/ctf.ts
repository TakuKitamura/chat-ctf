import { NextApiRequest, NextApiHandler } from "next";
import { NextApiResponseServerIO } from "types/next";
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions } from 'lib/session'

async function ctfRoute(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (req.method === "GET") {
    const db = await open(
      {
        filename: './mydb.sqlite',
        driver: sqlite3.Database
      }
    );


    const ctf = await db.all('SELECT * FROM Ctf');
    res.json(ctf);
  }
};
export default withIronSessionApiRoute(ctfRoute as NextApiHandler, sessionOptions)
