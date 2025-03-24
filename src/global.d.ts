// Global type declarations
declare module 'express' {
  interface Request {
    user?: any;
    headers: Record<string, string | undefined>;
    method: string;
    url: string;
  }

  interface Response {
    status(code: number): Response;
    json(data: any): void;
  }
}
