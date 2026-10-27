type PageType = {
  // 0 means "not saved yet"
  id: number;
  userId: string;
  notebookId: number;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export default PageType;
