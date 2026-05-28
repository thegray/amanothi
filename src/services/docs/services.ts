import { prisma } from "~/db/prisma";
import type { DocWithTags } from "./types";

async function attachTagsToDocs<T extends { id: bigint }>(
  docs: T[]
): Promise<(T & { tags: { tag: { id: number; name: string; slug: string } }[] })[]> {
  if (docs.length === 0) return docs.map((d) => ({ ...d, tags: [] }));
  const docIds = docs.map((d) => d.id);
  const docTags = await prisma.docTag.findMany({
    where: { docId: { in: docIds } },
  });
  const tagIds = [...new Set(docTags.map((dt) => dt.tagId))];
  const tags = await prisma.tag.findMany({
    where: { id: { in: tagIds } },
  });
  const tagMap = new Map(tags.map((t) => [t.id, t]));
  const tagMapByDoc = new Map<bigint, { tag: { id: number; name: string; slug: string } }[]>();
  for (const dt of docTags) {
    const list = tagMapByDoc.get(dt.docId) ?? [];
    const tag = tagMap.get(dt.tagId);
    if (tag) list.push({ tag: { id: tag.id, name: tag.name, slug: tag.slug } });
    tagMapByDoc.set(dt.docId, list);
  }
  return docs.map((d) => ({ ...d, tags: tagMapByDoc.get(d.id) ?? [] }));
}

export async function getDocsForUser(
  userId: bigint
): Promise<DocWithTags[]> {
  const docs = await prisma.doc.findMany({
    where: { userId, status: "active" },
    orderBy: { updatedAt: "desc" },
  });
  return attachTagsToDocs(docs);
}

export async function getDocForUser(
  userId: bigint,
  docId: bigint
): Promise<DocWithTags | null> {
  const doc = await prisma.doc.findFirst({
    where: { id: docId, userId, status: "active" },
  });
  if (!doc) return null;
  const [enriched] = await attachTagsToDocs([doc]);
  return enriched;
}

export async function createDoc(
  userId: bigint,
  content: string,
  docType: string = "md"
): Promise<{ id: bigint }> {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const doc = await prisma.doc.create({
    data: { userId, content, docType, createdAt: now, updatedAt: now },
  });
  return { id: doc.id };
}

export async function updateDoc(
  userId: bigint,
  docId: bigint,
  data: { content?: string; summary?: string | null }
): Promise<void> {
  await prisma.doc.updateMany({
    where: { id: docId, userId },
    data: { ...data, updatedAt: BigInt(Math.floor(Date.now() / 1000)) },
  });
}

export async function deleteDoc(
  userId: bigint,
  docId: bigint
): Promise<void> {
  await prisma.doc.updateMany({
    where: { id: docId, userId },
    data: { status: "deleted" },
  });
}
