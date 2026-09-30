import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.redirect(
    new URL("/wholesale/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
  );

  response.cookies.set({
    name: "wholesale_session",
    value: "",
    expires: new Date(0),
    path: "/",
  });

  return response;
}