import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "vlasnaoselya-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
      },
      async (username, password, done) => {
        const user = await storage.getUserByUsername(username);
        
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Incorrect username or password" });
        }
        
        return done(null, user);
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, email, password, firstName, lastName, middleName, phoneNumber } = req.body;

      if (!username || !email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "All required fields must be provided" });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const verificationCode = generateVerificationCode();

      // In a real app, we would send the verification code via email here
      console.log(`Verification code for ${email}: ${verificationCode}`);

      const hashedPassword = await hashPassword(password);

      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        middleName: middleName || "",
        phoneNumber: phoneNumber || "",
        isVerified: false,
        verificationCode
      });

      // Automatically log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(201).json({ ...user, password: undefined });
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Server error during registration" });
    }
  });

  app.post("/api/verify-email", async (req, res) => {
    try {
      const { email, code } = req.body;
      
      if (!email || !code) {
        return res.status(400).json({ message: "Email and verification code are required" });
      }

      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      if (user.verificationCode !== code) {
        return res.status(400).json({ message: "Invalid verification code" });
      }

      const updatedUser = await storage.updateUser(user.id, { isVerified: true, verificationCode: null });
      
      return res.status(200).json({ ...updatedUser, password: undefined });
    } catch (error) {
      console.error("Email verification error:", error);
      return res.status(500).json({ message: "Server error during email verification" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        
        return res.status(200).json({ ...user, password: undefined });
      });
    })(req, res, next);
  });

  app.post("/api/admin/login", (req, res, next) => {
    const { username, password } = req.body;
    
    if (username !== "admin" || password !== "mypassword") {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }
    
    // For a real app, we would authenticate against the database
    // For this demo, we're using hardcoded credentials
    req.login({ 
      id: 0, 
      username: "admin", 
      isAdmin: true,
      firstName: "Admin",
      lastName: "User",
      email: "admin@vlasnaoselya.com",
      isVerified: true
    } as Express.User, (err) => {
      if (err) return next(err);
      return res.status(200).json({ 
        id: 0, 
        username: "admin", 
        isAdmin: true,
        firstName: "Admin",
        lastName: "User",
        email: "admin@vlasnaoselya.com",
        isVerified: true
      });
    });
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = { ...req.user, password: undefined };
    res.json(user);
  });

  // Request a new verification code
  app.post("/api/request-verification", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      const verificationCode = generateVerificationCode();
      
      // In a real app, send the verification code via email
      console.log(`New verification code for ${email}: ${verificationCode}`);

      await storage.updateUser(user.id, { verificationCode });
      
      return res.status(200).json({ message: "Verification code sent" });
    } catch (error) {
      console.error("Request verification error:", error);
      return res.status(500).json({ message: "Server error during verification request" });
    }
  });
}
