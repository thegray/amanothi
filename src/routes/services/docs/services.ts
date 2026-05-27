import { prisma } from "~/db/prisma";
import type { DocWithTags } from "./types";

export async function getDocsForUser(
  userId: bigint
): Promise<DocWithTags[]> {
  return prisma.doc.findMany({
    where: { userId, status: "active" },
    include: { tags: { include: { tag: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getDocForUser(
  userId: bigint,
  docId: bigint
): Promise<DocWithTags | null> {
  return prisma.doc.findFirst({
    where: { id: docId, userId, status: "active" },
    include: { tags: { include: { tag: true } } },
  });
}

export async function createDoc(
  userId: bigint,
  content: string,
  docType: string = "md"
): Promise<{ id: bigint }> {
  const doc = await prisma.doc.create({
    data: { userId, content, docType },
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
    data,
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
