import type { RequestHandler } from "@builder.io/qwik-city";

export const onGet: RequestHandler = async (requestEvent) => {
  requestEvent.cookie.delete("session", { path: "/" });
  throw requestEvent.redirect(302, "/");
};
