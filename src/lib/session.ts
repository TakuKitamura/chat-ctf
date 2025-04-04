import type { SessionOptions } from 'iron-session'

export const sessionOptions: SessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: 'web-ctf',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}

export interface IronSessionData {
  user: {userID: string, iconURL: string}
}
