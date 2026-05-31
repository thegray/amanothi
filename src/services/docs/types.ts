export type DocTag = {
  tag: {
    id: number;
    name: string;
    slug: string;
  };
};

export type DocWithTags = {
  id: bigint;
  userId: bigint;
  content: string;
  summary: string | null;
  docType: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  tags: DocTag[];
};

export type SerializedDoc = {
  id: string;
  content: string;
  summary: string | null;
  docType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  tags: DocTag[];
};
