import type { RequestHandler } from "@builder.io/qwik-city";
import {
  getGoogleTokens,
  getGoogleUser,
  findOrCreateUser,
  createSessionToken,
} from "~/services/auth/services";

export const onGet: RequestHandler = async (requestEvent) => {
  const code = requestEvent.query.get("code");
  if (!code) {
    throw requestEvent.redirect(302, "/login/");
  }

  try {
    const tokens = await getGoogleTokens(code);
    const googleUser = await getGoogleUser(tokens.access_token);
    const user = await findOrCreateUser(googleUser);
    const sessionToken = await createSessionToken(user.id);

    requestEvent.cookie.set("session", sessionToken, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    throw requestEvent.redirect(302, "/doc/");
  } catch (e) {
    console.error("OAuth error:", e);
    throw requestEvent.redirect(302, "/login/");
  }
};
