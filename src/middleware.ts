import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, IronSessionData } from 'lib/session'

export const middleware = async (req: NextRequest) => {
  const url = req.nextUrl.pathname
  const res = NextResponse.next();
  if (url === '/api/login' || url === '/api/signup') {
    return res
  }

  const session = await getIronSession<IronSessionData>(req, res, sessionOptions);

  const { user } = session;

  if (user === undefined) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res;
}
export const config = {
  matcher: ['/', '/api/:path*'],
}