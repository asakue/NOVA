import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { storage, decrypt } from "./storage";
import { AuthUser } from "@shared/types";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function setupAuth(app: Express) {
  // Session setup
  app.use(session({
    name: "donstu.sid",
    secret: process.env.SESSION_SECRET || "donstu-vis-secret-key-12345",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    }
  }));

  // Authentication middleware
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (req.session.userId) {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        // Remove password from user object
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword as AuthUser;
      }
    }
    next();
  });

  // Check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
      next();
    } else {
      res.status(401).json({ message: "Необходима авторизация" });
    }
  };

  // Check if user is admin
  const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ message: "Доступ запрещен. Требуются права администратора." });
    }
  };

  // Login endpoint
  app.post("/api/login", async (req: Request, res: Response) => {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: "Пароль обязателен" });
    }
    
    try {
      // For this specific app, we have two hardcoded accounts
      let user;
      if (password === "adm") {
        user = await storage.getUserByUsername("admin");
      } else if (password === "stud") {
        user = await storage.getUserByUsername("student");
      }
      
      if (!user) {
        return res.status(401).json({ message: "Неверный пароль" });
      }
      
      // Set user session
      req.session.userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Ошибка сервера" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Ошибка при выходе из системы" });
      }
      res.clearCookie("donstu.sid");
      res.status(200).json({ message: "Выход выполнен успешно" });
    });
  });

  // Get current user
  app.get("/api/user", (req: Request, res: Response) => {
    if (req.user) {
      res.status(200).json(req.user);
    } else {
      res.status(401).json({ message: "Не авторизован" });
    }
  });

  return { isAuthenticated, isAdmin };
}
