import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('session');
    return response;
}