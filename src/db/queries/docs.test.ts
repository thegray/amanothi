import { describe, it, expect, vi, beforeEach } from "vitest";

const mockDb = {
  doc: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
  },
  docTag: {
    findMany: vi.fn(),
  },
  tag: {
    findMany: vi.fn(),
  },
};

vi.mock("~/lib/prisma", () => ({
  getPrismaClient: () => mockDb,
}));

const { getDocsForUser, getDocForUser, createDoc, updateDoc, deleteDoc } =
  await import("./doc");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getDocsForUser", () => {
  it("returns docs with tags", async () => {
    const docs = [
      { id: BigInt(1), userId: BigInt(10), content: "Doc 1", status: "active", summary: null, docType: "md", createdAt: BigInt(1000), updatedAt: BigInt(1001) },
      { id: BigInt(2), userId: BigInt(10), content: "Doc 2", status: "active", summary: "sum", docType: "md", createdAt: BigInt(1002), updatedAt: BigInt(1003) },
    ];
    mockDb.doc.findMany.mockResolvedValue(docs);
    mockDb.docTag.findMany.mockResolvedValue([
      { docId: BigInt(1), tagId: 1 },
      { docId: BigInt(2), tagId: 1 },
    ]);
    mockDb.tag.findMany.mockResolvedValue([
      { id: 1, name: "tag1", slug: "tag1" },
    ]);

    const result = await getDocsForUser(BigInt(10));

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(BigInt(1));
    expect(result[0].tags).toHaveLength(1);
    expect(result[0].tags[0].tag.name).toBe("tag1");
    expect(mockDb.doc.findMany).toHaveBeenCalledWith({
      where: { userId: BigInt(10), status: "active" },
      orderBy: { updatedAt: "desc" },
    });
  });

  it("returns empty array when no docs", async () => {
    mockDb.doc.findMany.mockResolvedValue([]);

    const result = await getDocsForUser(BigInt(10));

    expect(result).toEqual([]);
  });
});

describe("getDocForUser", () => {
  it("returns doc with tags when found", async () => {
    const doc = { id: BigInt(1), userId: BigInt(10), content: "Doc 1", status: "active", summary: null, docType: "md", createdAt: BigInt(1000), updatedAt: BigInt(1001) };
    mockDb.doc.findFirst.mockResolvedValue(doc);
    mockDb.docTag.findMany.mockResolvedValue([]);
    mockDb.tag.findMany.mockResolvedValue([]);

    const result = await getDocForUser(BigInt(10), BigInt(1));

    expect(result).not.toBeNull();
    expect(result!.id).toBe(BigInt(1));
    expect(result!.tags).toEqual([]);
  });

  it("returns null when not found", async () => {
    mockDb.doc.findFirst.mockResolvedValue(null);

    const result = await getDocForUser(BigInt(10), BigInt(999));

    expect(result).toBeNull();
  });
});

describe("createDoc", () => {
  it("creates a doc with default docType", async () => {
    mockDb.doc.create.mockResolvedValue({ id: BigInt(1) });

    const result = await createDoc(BigInt(10), "Hello");

    expect(result).toEqual({ id: BigInt(1) });
    expect(mockDb.doc.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: BigInt(10),
        content: "Hello",
        docType: "md",
      }),
    });
  });

  it("creates a doc with custom docType", async () => {
    mockDb.doc.create.mockResolvedValue({ id: BigInt(2) });

    const result = await createDoc(BigInt(10), "Hello", "todo");

    expect(result).toEqual({ id: BigInt(2) });
    expect(mockDb.doc.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        docType: "todo",
      }),
    });
  });
});

describe("updateDoc", () => {
  it("updates content", async () => {
    mockDb.doc.updateMany.mockResolvedValue({ count: 1 });

    await updateDoc(BigInt(10), BigInt(1), { content: "Updated" });

    expect(mockDb.doc.updateMany).toHaveBeenCalledWith({
      where: { id: BigInt(1), userId: BigInt(10) },
      data: expect.objectContaining({ content: "Updated" }),
    });
  });

  it("sets summary to null when explicitly passed", async () => {
    mockDb.doc.updateMany.mockResolvedValue({ count: 1 });

    await updateDoc(BigInt(10), BigInt(1), { summary: null });

    expect(mockDb.doc.updateMany).toHaveBeenCalledWith({
      where: { id: BigInt(1), userId: BigInt(10) },
      data: expect.objectContaining({ summary: null }),
    });
  });
});

describe("deleteDoc", () => {
  it("soft deletes a doc by setting status to deleted", async () => {
    mockDb.doc.updateMany.mockResolvedValue({ count: 1 });

    await deleteDoc(BigInt(10), BigInt(1));

    expect(mockDb.doc.updateMany).toHaveBeenCalledWith({
      where: { id: BigInt(1), userId: BigInt(10) },
      data: { status: "deleted" },
    });
  });
});
