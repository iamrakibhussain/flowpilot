import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out from client session" });

  // Explicitly purge the session cookie from the Next.js origin
  response.cookies.set("flowpilot_session", "", {
    path: "/",
    expires: new Date(0),
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
  });

  return response;
}
