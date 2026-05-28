import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeAction$, routeLoader$, Form } from "@builder.io/qwik-city";
import { getUserIdFromSession } from "~/services/auth/services";
import { createDoc } from "~/services/docs/services";

export const useUser = routeLoader$(async (requestEvent) => {
  const userId = await getUserIdFromSession(requestEvent);
  if (!userId) throw requestEvent.redirect(302, "/login/");
  return userId;
});

export const useCreateDoc = routeAction$(async (formData, requestEvent) => {
  const userId = await getUserIdFromSession(requestEvent);
  if (!userId) throw requestEvent.redirect(302, "/login/");

  const content = formData.content as string;
  const docType = (formData.docType as string) || "md";

  const doc = await createDoc(userId, content, docType);

  throw requestEvent.redirect(302, `/doc/${doc.id}/`);
});

export default component$(() => {
  const createDoc = useCreateDoc();

  return (
    <div class="mx-auto max-w-3xl p-8">
      <h1 class="mb-6 text-2xl font-bold text-gray-800">New Note</h1>
      <Form action={createDoc} class="space-y-4">
        <div>
          <label for="content" class="mb-1 block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            rows={15}
            required
            class="w-full rounded-lg border border-gray-300 p-4 font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            placeholder="Start writing..."
          />
        </div>
        <div class="flex items-center gap-4">
          <div>
            <label for="docType" class="mb-1 block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              id="docType"
              name="docType"
              class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="md">Markdown</option>
              <option value="list">List</option>
            </select>
          </div>
          <button
            type="submit"
            class="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Create Note
          </button>
        </div>
      </Form>
    </div>
  );
});

export const head: DocumentHead = {
  title: "New Note - Amanothi",
};
