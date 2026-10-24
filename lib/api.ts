import firebase from "firebase/app";
import "firebase/auth";
import { toast } from "react-semantic-toasts";
import Notebook from "../types/notebook";
import Page from "../types/page";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8787"
).replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Wait for Firebase to restore the session on first load, then return a
// (auto-refreshed) ID token.
const getIdToken = async (): Promise<string> => {
  const auth = firebase.auth();
  let user = auth.currentUser;
  if (!user) {
    user = await new Promise<firebase.User | null>((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((u) => {
        unsubscribe();
        resolve(u);
      });
    });
  }
  if (!user) throw new ApiError(401, "Not signed in");
  return user.getIdToken();
};

const errorMessage = (body: any, status: number): string => {
  if (body && Array.isArray(body.errors)) return body.errors.join(", ");
  if (body && typeof body.error === "string") return body.error;
  return `Request failed (${status})`;
};

export const request = async <T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> => {
  const token = await getIdToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 204) return undefined as T;

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // non-JSON body
  }
  if (!res.ok) throw new ApiError(res.status, errorMessage(json, res.status));
  return json as T;
};

// Raw API shapes (snake_case) and the single place they become frontend types.
type RawNotebook = {
  id: number;
  user_id: string;
  name: string;
  created_at: string | null;
  updated_at: string | null;
};

type RawPage = {
  id: number;
  user_id: string;
  notebook_id: number;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
};

const toDate = (s: string | null): Date | null => (s ? new Date(s) : null);

export const toNotebook = (r: RawNotebook): Notebook => ({
  id: r.id,
  userId: r.user_id,
  name: r.name,
  createdAt: toDate(r.created_at),
  updatedAt: toDate(r.updated_at),
});

export const toPage = (r: RawPage): Page => ({
  id: r.id,
  userId: r.user_id,
  notebookId: r.notebook_id,
  name: r.name,
  content: r.content,
  createdAt: new Date(r.created_at),
  updatedAt: new Date(r.updated_at),
});

// Paths (also used as SWR keys)
export const notebooksPath = "/notebooks";
export const notebookPath = (name: string) =>
  `/notebooks/${encodeURIComponent(name)}`;
export const pagesPath = (notebook: string) =>
  `${notebookPath(notebook)}/pages`;
export const pagePath = (notebook: string, id: number | string) =>
  `${pagesPath(notebook)}/${id}`;

// SWR fetchers
export const fetchNotebooks = async (path: string) =>
  (await request<RawNotebook[]>("GET", path)).map(toNotebook);
export const fetchPages = async (path: string) =>
  (await request<RawPage[]>("GET", path)).map(toPage);
export const fetchPage = async (path: string) =>
  toPage(await request<RawPage>("GET", path));

// Writes
export const createNotebook = async (name: string) =>
  toNotebook(await request<RawNotebook>("POST", notebooksPath, { name }));
export const deleteNotebook = (name: string) =>
  request<void>("DELETE", notebookPath(name));
export const createPage = async (
  notebook: string,
  name: string,
  content: string,
) =>
  toPage(
    await request<RawPage>("POST", pagesPath(notebook), { name, content }),
  );
export const updatePage = async (
  notebook: string,
  id: number,
  name: string,
  content: string,
) =>
  toPage(
    await request<RawPage>("PATCH", pagePath(notebook, id), { name, content }),
  );
export const deletePage = (notebook: string, id: number) =>
  request<void>("DELETE", pagePath(notebook, id));

export const showApiError = (e: unknown) => {
  console.error(e);
  const description = e instanceof Error ? e.message : String(e);
  toast({ type: "error", title: "Error", description, time: 5000 });
};
