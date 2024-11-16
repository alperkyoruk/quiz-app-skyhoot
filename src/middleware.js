import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getToken } from './services/auth';

const secret = process.env.JWT_SECRET; // replace with your actual JWT secret

export function middleware(request) {
  // Get the token from the cookies
  const token = getToken();

  // Check if the token exists, if it does, validate and decode it
  if (token) {
    try {
      const decoded = jwt.verify(token, secret); // Decode the token using the secret key

      // Check if the token has expired
      if (decoded.exp < Date.now() / 1000) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Allow access to the request if the user is authenticated
      return NextResponse.next();
    } catch (error) {
      // If the token is invalid or expired, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // If there's no token and the path is not allowed for non-users
  const allowedPaths = ['/', '/join', '/login', '/register'];
  if (!allowedPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow access to the allowed paths for non-users
  return NextResponse.next();
}

// Define the matcher to apply middleware to all paths
export const config = {
  matcher: '/:path*',
};
