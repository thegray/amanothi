import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { getUserIdFromSession } from "~/services/auth/services";
import { getDocsForUser } from "~/services/docs/services";
export const useDocs = routeLoader$(async (requestEvent) => {
  const userId = await getUserIdFromSession(requestEvent);
  if (!userId) return [];
  const docs = await getDocsForUser(userId);
  return docs.map((doc) => ({
    ...doc,
    id: doc.id.toString(),
    userId: doc.userId.toString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }));
});

export default component$(() => {
  const docs = useDocs();

  return (
    <div class="mx-auto max-w-4xl p-8">
      <div class="mb-8 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800">My Notes</h1>
        <a
          href="/doc/new"
          class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          + New Note
        </a>
      </div>

      {docs.value.length === 0 ? (
        <div class="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p class="text-gray-500">No notes yet</p>
          <a
            href="/doc/new"
            class="mt-2 inline-block text-blue-600 hover:underline"
          >
            Create your first note
          </a>
        </div>
      ) : (
        <div class="grid gap-4 sm:grid-cols-2">
          {docs.value.map((doc) => (
            <a
              key={String(doc.id)}
              href={`/doc/${String(doc.id)}/`}
              class="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div class="mb-2 flex items-center gap-2">
                <span class="text-xs font-medium text-blue-600 uppercase">
                  {doc.docType}
                </span>
                {doc.tags.map((t) => (
                  <span
                    key={t.tag.id}
                    class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                  >
                    {t.tag.name}
                  </span>
                ))}
              </div>
              <p class="mb-1 line-clamp-1 font-medium text-gray-800">
                {doc.content.split("\n")[0] || "Untitled"}
              </p>
              {doc.summary && (
                <p class="line-clamp-2 text-sm text-gray-500">{doc.summary}</p>
              )}
              <p class="mt-2 text-xs text-gray-400">
                {new Date(doc.updatedAt).toLocaleDateString()}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: "My Notes - Amanothi",
};
