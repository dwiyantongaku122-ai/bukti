import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for local file uploads
const uploadDir = path.join(process.cwd(), "client/public/uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storageConfig = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storageConfig });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // Seed Admin User
  const existingAdmin = await storage.getUserByUsername("admin");
  if (!existingAdmin) {
    await storage.createUser({
      username: "admin",
      password: "bell2026", // Plain text as requested for MVP, hash in prod
      isAdmin: true
    });
    console.log("Admin user seeded.");
  }

  // Seed Games
  const existingGames = await storage.getGames();
  if (existingGames.length === 0) {
    await storage.createGame({
      provider: "PRAGMATIC PLAY",
      name: "GATES OF OLYMPUS",
      deposit: "20.000",
      withdraw: "50.000",
      bet: "200",
      dateTime: new Date().toLocaleString(),
      imageUrl: "https://placehold.co/300x300/1e3a8a/FFFFFF/png?text=OLYMPUS",
      iconUrl: "https://placehold.co/50x50/1e3a8a/FFFFFF/png?text=P",
      outlineColor: "#fbbf24", // Gold/Amber
      isPublished: true
    });
    await storage.createGame({
      provider: "PG SOFT",
      name: "MAHJONG WAYS 2",
      deposit: "20.000",
      withdraw: "50.000",
      bet: "200",
      dateTime: new Date().toLocaleString(),
      imageUrl: "https://placehold.co/300x300/991b1b/FFFFFF/png?text=MAHJONG",
      iconUrl: "https://placehold.co/50x50/991b1b/FFFFFF/png?text=PG",
      outlineColor: "#ef4444", // Red
      isPublished: true
    });
     await storage.createGame({
      provider: "HABANERO",
      name: "KOI GATE",
      deposit: "10.000",
      withdraw: "50.000",
      bet: "180",
      dateTime: new Date().toLocaleString(),
      imageUrl: "https://placehold.co/300x300/065f46/FFFFFF/png?text=KOI",
      iconUrl: "https://placehold.co/50x50/065f46/FFFFFF/png?text=H",
      outlineColor: "#34d399", // Emerald
      isPublished: true
    });
     await storage.createGame({
      provider: "SPADEGAMING",
      name: "BROTHERS KINGDOM",
      deposit: "20.000",
      withdraw: "50.000",
      bet: "200",
      dateTime: new Date().toLocaleString(),
      imageUrl: "https://placehold.co/300x300/4c1d95/FFFFFF/png?text=KINGDOM",
      iconUrl: "https://placehold.co/50x50/4c1d95/FFFFFF/png?text=S",
      outlineColor: "#a78bfa", // Violet
      isPublished: true
    });
    console.log("Dummy games seeded.");
  }

  // Auth Routes
  app.post(api.auth.login.path, async (req, res) => {
    const { username, password } = req.body;
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Set session
    (req.session as any).userId = user.id;
    (req.session as any).isAdmin = user.isAdmin;
    res.json({ message: "Logged in successfully" });
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy((err) => {
      res.sendStatus(200);
    });
  });

  app.get(api.auth.check.path, async (req, res) => {
    if (!req.session) return res.json(null);
    const userId = (req.session as any).userId;
    if (!userId) return res.json(null);
    const user = await storage.getUser(userId);
    res.json(user || null);
  });

  // Settings Routes
  app.get(api.settings.get.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.patch(api.settings.update.path, async (req, res) => {
    if (!(req.session as any).isAdmin) return res.sendStatus(401);
    const settings = await storage.updateSettings(req.body);
    res.json(settings);
  });

  // Game Routes
  app.get(api.games.list.path, async (req, res) => {
    const games = await storage.getGames();
    res.json(games);
  });

  app.post(api.games.create.path, async (req, res) => {
    if (!(req.session as any).isAdmin) return res.sendStatus(401);
    try {
      const input = api.games.create.input.parse(req.body);
      const game = await storage.createGame(input);
      res.status(201).json(game);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
           message: err.errors[0].message,
           field: err.errors[0].path.join('.')
        });
      }
      throw err;
    }
  });

  app.put(api.games.update.path, async (req, res) => {
    if (!(req.session as any).isAdmin) return res.sendStatus(401);
    const id = Number(req.params.id);
    const game = await storage.updateGame(id, req.body);
    res.json(game);
  });

  app.delete(api.games.delete.path, async (req, res) => {
    if (!(req.session as any).isAdmin) return res.sendStatus(401);
    await storage.deleteGame(Number(req.params.id));
    res.sendStatus(204);
  });

  // Button Routes
  app.get(api.buttons.list.path, async (req, res) => {
    const btns = await storage.getButtons();
    res.json(btns);
  });

  app.post(api.buttons.create.path, async (req, res) => {
    if (!(req.session as any).isAdmin) return res.sendStatus(401);
    try {
      const input = api.buttons.create.input.parse(req.body);
      const button = await storage.createButton(input);
      res.status(201).json(button);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.put(api.buttons.update.path, async (req, res) => {
    if (!(req.session as any).isAdmin) return res.sendStatus(401);
    const id = Number(req.params.id);
    const existing = await storage.getButton(id);
    if (!existing) return res.status(404).json({ message: "Button not found" });
    try {
      const input = api.buttons.update.input.parse(req.body);
      const button = await storage.updateButton(id, input);
      res.json(button);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.delete(api.buttons.delete.path, async (req, res) => {
    if (!(req.session as any).isAdmin) return res.sendStatus(401);
    const id = Number(req.params.id);
    const existing = await storage.getButton(id);
    if (!existing) return res.status(404).json({ message: "Button not found" });
    await storage.deleteButton(id);
    res.sendStatus(204);
  });

  // Upload Route
  app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!(req.session as any).isAdmin) return res.sendStatus(401);
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
    // Return the URL to access the file
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });

  return httpServer;
}
