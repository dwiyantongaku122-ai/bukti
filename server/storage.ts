import { db } from "./db";
import {
  users, settings, games, buttons,
  type User, type InsertUser,
  type Settings, type InsertSettings,
  type Game, type InsertGame,
  type SiteButton, type InsertButton
} from "../shared/schema";
import { eq, asc } from "drizzle-orm";

export interface IStorage {
  // User/Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings>;

  // Games
  getGames(): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: number, game: Partial<InsertGame>): Promise<Game>;
  deleteGame(id: number): Promise<void>;

  // Buttons
  getButtons(): Promise<SiteButton[]>;
  getButton(id: number): Promise<SiteButton | undefined>;
  createButton(button: InsertButton): Promise<SiteButton>;
  updateButton(id: number, button: Partial<InsertButton>): Promise<SiteButton>;
  deleteButton(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User/Auth
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Settings
  async getSettings(): Promise<Settings> {
    const [existing] = await db.select().from(settings).limit(1);
    if (existing) return existing;
    
    // Create default settings if none exist
    const [newSettings] = await db.insert(settings).values({
      logoUrl: "https://placehold.co/200x80/000000/FFFFFF/png?text=LOGO",
      backgroundUrl: "",
      buttonColor: "#3b82f6",
      loginUrl: "/login",
      registerUrl: "/register",
      desktopColumns: 4,
      mobileColumns: 3,
      gameIconSize: 50,
      siteTitle: "Game Site"
    }).returning();
    return newSettings;
  }

  async updateSettings(updates: Partial<InsertSettings>): Promise<Settings> {
    const [existing] = await db.select().from(settings).limit(1);
    let id = existing?.id;
    
    if (!id) {
       const [created] = await db.insert(settings).values({
         ...updates,
         // Default values if creating
         desktopColumns: updates.desktopColumns || 4,
         mobileColumns: updates.mobileColumns || 3,
       } as any).returning(); // Cast to any to bypass strict checks on partial
       return created;
    }

    const [updated] = await db.update(settings)
      .set(updates)
      .where(eq(settings.id, id))
      .returning();
    return updated;
  }

  // Games
  async getGames(): Promise<Game[]> {
    return await db.select().from(games).orderBy(games.createdAt);
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db.insert(games).values(insertGame).returning();
    return game;
  }

  async updateGame(id: number, updates: Partial<InsertGame>): Promise<Game> {
    const [game] = await db.update(games)
      .set(updates)
      .where(eq(games.id, id))
      .returning();
    return game;
  }

  async deleteGame(id: number): Promise<void> {
    await db.delete(games).where(eq(games.id, id));
  }

  // Buttons
  async getButtons(): Promise<SiteButton[]> {
    return await db.select().from(buttons).orderBy(asc(buttons.sortOrder), asc(buttons.id));
  }

  async getButton(id: number): Promise<SiteButton | undefined> {
    const [button] = await db.select().from(buttons).where(eq(buttons.id, id));
    return button;
  }

  async createButton(insertButton: InsertButton): Promise<SiteButton> {
    const [button] = await db.insert(buttons).values(insertButton).returning();
    return button;
  }

  async updateButton(id: number, updates: Partial<InsertButton>): Promise<SiteButton> {
    const [button] = await db.update(buttons)
      .set(updates)
      .where(eq(buttons.id, id))
      .returning();
    return button;
  }

  async deleteButton(id: number): Promise<void> {
    await db.delete(buttons).where(eq(buttons.id, id));
  }
}

export const storage = new DatabaseStorage();
