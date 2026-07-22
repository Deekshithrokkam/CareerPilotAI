import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: "That endpoint was not found." });
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({ error: "Please check the highlighted fields.", details: error.flatten() });
  }

  console.error(error);
  res.status(500).json({ error: "Something went wrong. Please try again." });
}
