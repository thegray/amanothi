import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { getUserIdFromSession } from "~/services/auth/services";

export const useAuth = routeLoader$(async (requestEvent) => {
  const userId = await getUserIdFromSession(requestEvent);
  if (userId) throw requestEvent.redirect(302, "/doc/");
  return null;
});

export default component$(() => {
  return (
    <div class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div class="text-center">
        <h1 class="mb-4 text-6xl font-bold">Amanothi</h1>
        <p class="mb-8 text-xl text-gray-300">Your note-taking companion</p>
        <a
          href="/login/"
          class="inline-block rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold transition hover:bg-blue-500"
        >
          Get Started
        </a>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Amanothi - Notes App",
};
