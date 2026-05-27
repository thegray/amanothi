import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeAction$, routeLoader$, Form } from "@builder.io/qwik-city";
import { getUserIdFromSession } from "../../services/auth/services";
import {
  getDocForUser,
  updateDoc,
  deleteDoc,
} from "../../services/docs/services";

export const useDoc = routeLoader$(async (requestEvent) => {
  const userId = await getUserIdFromSession(requestEvent);
  if (!userId) throw requestEvent.redirect(302, "/login/");

  const docId = BigInt(requestEvent.params.docId);
  const doc = await getDocForUser(userId, docId);
  if (!doc) throw requestEvent.redirect(302, "/app/");
  return {
    ...doc,
    id: doc.id.toString(),
    userId: String(doc.userId),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
});

export const useUpdateDoc = routeAction$(async (formData, requestEvent) => {
  const userId = await getUserIdFromSession(requestEvent);
  if (!userId) throw requestEvent.redirect(302, "/login/");

  const docId = BigInt(requestEvent.params.docId);
  const content = formData.content as string;
  const summary = (formData.summary as string) || null;

  await updateDoc(userId, docId, { content, summary });
});

export const useDeleteDoc = routeAction$(async (_, requestEvent) => {
  const userId = await getUserIdFromSession(requestEvent);
  if (!userId) throw requestEvent.redirect(302, "/login/");

  const docId = BigInt(requestEvent.params.docId);
  await deleteDoc(userId, docId);
  throw requestEvent.redirect(302, "/app/");
});

export default component$(() => {
  const doc = useDoc();
  const updateDoc = useUpdateDoc();
  const deleteDoc = useDeleteDoc();

  return (
    <div class="mx-auto max-w-3xl p-8">
      <div class="mb-4 flex items-center justify-between">
        <a
          href="/app/"
          class="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to notes
        </a>
        <div class="flex items-center gap-3">
          <span class="text-xs text-gray-400">
            Updated {new Date(doc.value.updatedAt).toLocaleString()}
          </span>
          <Form action={deleteDoc}>
            <button
              type="submit"
              class="rounded-lg px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50"
            >
              Delete
            </button>
          </Form>
        </div>
      </div>

      <Form action={updateDoc} class="space-y-4">
        <div>
          <textarea
            id="content"
            name="content"
            rows={20}
            class="w-full rounded-lg border border-gray-300 p-4 font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            {doc.value.content}
          </textarea>
        </div>
        <div>
          <label for="summary" class="mb-1 block text-sm font-medium text-gray-700">
            Summary
          </label>
          <input
            id="summary"
            name="summary"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            value={doc.value.summary || ""}
          />
        </div>
        <div class="flex items-center gap-2">
          <button
            type="submit"
            class="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            Save
          </button>
          {doc.value.docType === "md" && (
            <a
              href={`/app/${doc.value.id}/preview`}
              class="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
            >
              Preview
            </a>
          )}
        </div>
      </Form>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Edit Note - Amanothi",
};
