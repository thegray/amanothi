import { SignJWT, jwtVerify } from "jose";
import type { RequestEventBase } from "@builder.io/qwik-city";
import { prisma } from "~/db/prisma";
import type { GoogleTokenResponse, GoogleUser, AuthUser } from "./types";

function getSecret() {
  const sessionSecret = import.meta.env.VITE_SESSION_SECRET;
  if (!sessionSecret) throw new Error("VITE_SESSION_SECRET is not set");
  return new TextEncoder().encode(sessionSecret);
}

export function getGoogleOAuthURL(): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function getGoogleTokens(code: string): Promise<GoogleTokenResponse> {
  const secret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      client_secret: secret,
      redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token exchange failed: ${text}`);
  }
  return res.json();
}

export async function getGoogleUser(accessToken: string): Promise<GoogleUser> {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch Google user");
  return res.json();
}

function unixNow(): bigint {
  return BigInt(Math.floor(Date.now() / 1000));
}

export async function findOrCreateUser(googleUser: GoogleUser): Promise<{ id: bigint }> {
  const now = unixNow();
  const user = await prisma.user.upsert({
    where: { email: googleUser.email },
    update: {
      displayName: googleUser.name,
      tokenVersion: { increment: 1 },
      updatedAt: now,
    },
    create: {
      email: googleUser.email,
      displayName: googleUser.name,
      tokenVersion: 1,
      createdAt: now,
      updatedAt: now,
    },
  });
  return { id: user.id };
}

export async function createSessionToken(userId: bigint): Promise<string> {
  return new SignJWT({ userId: String(userId) })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function getUserIdFromSession(
  requestEvent: RequestEventBase
): Promise<bigint | null> {
  const cookie = requestEvent.cookie.get("session");
  if (!cookie) return null;
  try {
    const { payload } = await jwtVerify(cookie.value, getSecret());
    return BigInt(payload.userId as string);
  } catch {
    return null;
  }
}

export async function getUserById(
  userId: bigint
): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  };
}
