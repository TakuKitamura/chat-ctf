import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session/edge";

export const middleware = async (req: NextRequest) => {
  const url = req.nextUrl.pathname
  const res = NextResponse.next();
  if (url === '/api/login' || url === '/api/signup') {
    return res
  }

  const session = await getIronSession(req, res, {
    cookieName: "web-ctf",
    password: process.env.SECRET_COOKIE_PASSWORD as string ,
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
  });

  const { user } = session;

  if (user === undefined) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res;
}
export const config = {
  matcher: ['/', '/api/:path*'],
}