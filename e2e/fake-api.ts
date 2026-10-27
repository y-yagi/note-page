import type { Page, Request, Route } from "@playwright/test";
import { API_BASE_URL } from "./env";

// An in-memory stand-in for notebook-edge-api, mirroring its routes,
// validations and status codes. One instance per test (one user).

type Notebook = {
  id: number;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

type PageRecord = {
  id: number;
  user_id: string;
  notebook_id: number;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
};

type Reply = { status: number; body?: unknown };

const DEFAULT_NAME = "default";

const notFound: Reply = { status: 404, body: { error: "not found" } };

const notebookErrors = (name: unknown): string[] => {
  if (typeof name !== "string" || name === "") return ["name can't be blank"];
  if (name.length > 100) return ["name is too long"];
  if (!/^(?!\.\.?$)[^/]+$/.test(name)) return ["name is invalid"];
  return [];
};

// The user id is the token's "sub"; the emulator's tokens are unsigned JWTs.
const userIdFrom = (request: Request): string | null => {
  const auth = request.headers()["authorization"] || "";
  const token = auth.match(/^Bearer (.+)$/)?.[1];
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    return JSON.parse(Buffer.from(payload, "base64url").toString()).sub;
  } catch {
    return null;
  }
};

export class FakeApi {
  notebooks: Notebook[] = [];
  pages: PageRecord[] = [];
  // "METHOD /path" of every request the app made (not preflights)
  requests: string[] = [];
  private nextId = 1;
  private clock = Date.parse("2026-01-01T00:00:00Z");

  async install(page: Page) {
    await page.route(`${API_BASE_URL}/**`, (route) => this.handle(route));
  }

  private now() {
    this.clock += 1000;
    return new Date(this.clock).toISOString();
  }

  private async handle(route: Route) {
    const request = route.request();
    const cors = {
      "access-control-allow-origin": request.headers()["origin"] || "*",
      "access-control-allow-methods": "GET, POST, PATCH, DELETE",
      "access-control-allow-headers": "Authorization, Content-Type",
    };
    if (request.method() === "OPTIONS") {
      return route.fulfill({ status: 204, headers: cors });
    }

    const path = new URL(request.url()).pathname;
    this.requests.push(`${request.method()} ${path}`);

    const userId = userIdFrom(request);
    const reply: Reply = userId
      ? this.dispatch(request.method(), path, userId, request.postDataJSON())
      : { status: 401, body: { error: "authentication required" } };

    if (reply.status === 204) {
      return route.fulfill({ status: 204, headers: cors });
    }
    return route.fulfill({
      status: reply.status,
      headers: cors,
      contentType: "application/json",
      body: JSON.stringify(reply.body),
    });
  }

  private dispatch(
    method: string,
    path: string,
    userId: string,
    body: any,
  ): Reply {
    const segments = path.split("/").slice(1).map(decodeURIComponent);
    const [root, notebookName, sub, pageId] = segments;
    if (root !== "notebooks") return notFound;

    if (segments.length === 1) {
      if (method === "GET") return this.indexNotebooks(userId);
      if (method === "POST") return this.createNotebook(userId, body?.name);
      return notFound;
    }

    const notebook = this.findNotebook(userId, notebookName);
    if (segments.length === 2) {
      if (method !== "DELETE") return notFound;
      return notebook ? this.destroyNotebook(notebook) : notFound;
    }

    if (sub !== "pages" || segments.length > 4 || !notebook) return notFound;

    if (segments.length === 3) {
      if (method === "GET")
        return { status: 200, body: this.pagesOf(notebook) };
      if (method === "POST") return this.createPage(notebook, body);
      return notFound;
    }

    const page = this.pagesOf(notebook).find((p) => String(p.id) === pageId);
    if (!page) return notFound;
    if (method === "GET") return { status: 200, body: page };
    if (method === "PATCH") return this.updatePage(page, body);
    if (method === "DELETE") {
      this.pages = this.pages.filter((p) => p !== page);
      return { status: 204 };
    }
    return notFound;
  }

  private findNotebook(userId: string, name: string) {
    return this.notebooks.find((n) => n.user_id === userId && n.name === name);
  }

  private findOrCreateNotebook(userId: string, name: string) {
    const existing = this.findNotebook(userId, name);
    if (existing) return existing;
    const now = this.now();
    const notebook = {
      id: this.nextId++,
      user_id: userId,
      name,
      created_at: now,
      updated_at: now,
    };
    this.notebooks.push(notebook);
    return notebook;
  }

  private indexNotebooks(userId: string): Reply {
    this.findOrCreateNotebook(userId, DEFAULT_NAME);
    const mine = this.notebooks
      .filter((n) => n.user_id === userId)
      .sort((a, b) => a.name.localeCompare(b.name));
    return { status: 200, body: mine };
  }

  private createNotebook(userId: string, name: unknown): Reply {
    const errors = notebookErrors(name);
    if (errors.length > 0) return { status: 422, body: { errors } };
    return {
      status: 201,
      body: this.findOrCreateNotebook(userId, name as string),
    };
  }

  private destroyNotebook(notebook: Notebook): Reply {
    if (notebook.name === DEFAULT_NAME) {
      return {
        status: 422,
        body: { error: "the default notebook cannot be deleted" },
      };
    }
    if (this.pagesOf(notebook).length > 0) {
      return { status: 409, body: { error: "the notebook has pages" } };
    }
    this.notebooks = this.notebooks.filter((n) => n !== notebook);
    return { status: 204 };
  }

  private pagesOf(notebook: Notebook) {
    return this.pages
      .filter((p) => p.notebook_id === notebook.id)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at) || b.id - a.id);
  }

  private createPage(notebook: Notebook, body: any): Reply {
    if (!body?.name) {
      return { status: 422, body: { errors: ["name can't be blank"] } };
    }
    const now = this.now();
    const page = {
      id: this.nextId++,
      user_id: notebook.user_id,
      notebook_id: notebook.id,
      name: body.name,
      content: body.content ?? "",
      created_at: now,
      updated_at: now,
    };
    this.pages.push(page);
    return { status: 201, body: page };
  }

  private updatePage(page: PageRecord, body: any): Reply {
    if (body?.name !== undefined && body.name === "") {
      return { status: 422, body: { errors: ["name can't be blank"] } };
    }
    if (body?.name !== undefined) page.name = body.name;
    if (body?.content !== undefined) page.content = body.content;
    page.updated_at = this.now();
    return { status: 200, body: page };
  }
}
