import { getAuth, clerkClient } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      isAdmin?: boolean;
    }
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = auth.userId;
  next();
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = await clerkClient.users.getUser(auth.userId);
  if (user.publicMetadata?.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  req.userId = auth.userId;
  req.isAdmin = true;
  next();
}

/** Attaches userId/isAdmin if signed in, but never blocks the request. */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const auth = getAuth(req);
  if (auth?.userId) {
    req.userId = auth.userId;
    try {
      const user = await clerkClient.users.getUser(auth.userId);
      req.isAdmin = user.publicMetadata?.role === "admin";
    } catch {
      req.isAdmin = false;
    }
  }
  next();
}
