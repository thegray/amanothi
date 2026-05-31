import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";
import { getUserIdFromSession, getUserById } from "~/services/auth/services";

export const useUser = routeLoader$(async (requestEvent) => {
  const userId = await getUserIdFromSession(requestEvent);
  if (!userId) throw requestEvent.redirect(302, "/login/");
  const user = await getUserById(userId);
  if (!user) throw requestEvent.redirect(302, "/login/");
  return { id: Number(user.id), displayName: user.displayName, email: user.email };
});

export default component$(() => {
  const user = useUser();
  const loc = useLocation();

  const navItems = [
    { href: "/doc/", label: "My Notes", icon: "📝" },
    { href: "/doc/new", label: "New Note", icon: "➕" },
  ];

  return (
    <div class="flex h-screen bg-gray-50">
      <aside class="flex w-64 flex-col border-r border-gray-200 bg-white">
        <div class="flex items-center gap-2 border-b border-gray-200 px-6 py-4">
          <span class="text-2xl">📓</span>
          <span class="text-xl font-bold text-gray-800">Amanothi</span>
        </div>
        <div class="flex items-center gap-3 border-b border-gray-200 px-6 py-4">
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
            {(user.value.displayName || user.value.email).charAt(0).toUpperCase()}
          </div>
          <div class="truncate">
            <p class="text-sm font-medium text-gray-800">{user.value.displayName || user.value.email}</p>
            <p class="text-xs text-gray-500">{user.value.email}</p>
          </div>
        </div>
        <nav class="flex-1 p-4">
          <ul class="space-y-1">
            {navItems.map((item) => {
              const isActive = loc.url.pathname === item.href;
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    class={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        <div class="border-t border-gray-200 p-4">
          <a
            href="/logout/"
            class="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Sign Out
          </a>
        </div>
      </aside>
      <main class="flex-1 overflow-y-auto">
        <Slot />
      </main>
    </div>
  );
});
