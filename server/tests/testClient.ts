import request, { type Response } from "supertest";
import type { Express } from "express";

/**
 * Wraps a supertest agent (which persists cookies across requests, like a browser session)
 * and additionally tracks the double-submit CSRF cookie, attaching it as the X-CSRF-Token
 * header on every mutating request — mirroring exactly what the real httpClient.ts does.
 */
export class TestClient {
  private readonly agent: ReturnType<typeof request.agent>;
  private csrfToken: string | null = null;

  constructor(app: Express) {
    this.agent = request.agent(app);
  }

  private captureCsrf(res: Response): Response {
    const setCookie = res.headers["set-cookie"];
    const cookies = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
    for (const cookie of cookies) {
      const match = cookie.match(/^csrf_token=([^;]+)/);
      if (match) this.csrfToken = match[1];
    }
    return res;
  }

  async get(path: string): Promise<Response> {
    return this.captureCsrf(await this.agent.get(path));
  }

  async post(path: string, body?: unknown): Promise<Response> {
    const req = this.agent.post(path).set("Content-Type", "application/json");
    if (this.csrfToken) req.set("X-CSRF-Token", this.csrfToken);
    return this.captureCsrf(await req.send(body ?? {}));
  }

  async patch(path: string, body?: unknown): Promise<Response> {
    const req = this.agent.patch(path).set("Content-Type", "application/json");
    if (this.csrfToken) req.set("X-CSRF-Token", this.csrfToken);
    return this.captureCsrf(await req.send(body ?? {}));
  }

  async delete(path: string, body?: unknown): Promise<Response> {
    const req = this.agent.delete(path).set("Content-Type", "application/json");
    if (this.csrfToken) req.set("X-CSRF-Token", this.csrfToken);
    return this.captureCsrf(await req.send(body ?? {}));
  }

  /** Directly sets the CSRF header value used on the next mutating request — for reuse-attack tests. */
  overrideCsrfToken(token: string | null): void {
    this.csrfToken = token;
  }

  getCsrfToken(): string | null {
    return this.csrfToken;
  }
}
