import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  logoUrl: text("logo_url").default(""),
  backgroundUrl: text("background_url").default(""),
  buttonColor: text("button_color").default("#3b82f6"),
  buttonOutlineColor: text("button_outline_color").default("#60a5fa"),
  buttonShape: text("button_shape").default("rounded-full"),
  loginUrl: text("login_url").default("#"),
  registerUrl: text("register_url").default("#"),
  desktopColumns: integer("desktop_columns").default(4),
  mobileColumns: integer("mobile_columns").default(3),
  gameIconSize: integer("game_icon_size").default(50),
  logoSize: integer("logo_size").default(220),
  siteTitle: text("site_title").default("Landing Page"),
  outlineAnimation: text("outline_animation").default("pulse"),
  outlineAnimationSpeed: integer("outline_animation_speed").default(3),
  gameCardSize: integer("game_card_size").default(200),
  outlineThickness: integer("outline_thickness").default(2),
  snowEnabled: boolean("snow_enabled").default(false),
  snowSpeed: integer("snow_speed").default(5),
  snowAmount: integer("snow_amount").default(50),
  snowParticleSize: integer("snow_particle_size").default(20),
  snowImageUrl1: text("snow_image_url_1").default(""),
  snowImageUrl2: text("snow_image_url_2").default(""),
  snowImageUrl3: text("snow_image_url_3").default(""),
  snowImageUrl4: text("snow_image_url_4").default(""),
  cardBgColor: text("card_bg_color").default("#0c1929"),
  buttonHeight: integer("button_height").default(48),
  buttonWidth: integer("button_width").default(300),
  bgColor: text("bg_color").default("#020617"),
  siteDescription: text("site_description").default(""),
  siteDescriptionSize: integer("site_description_size").default(16),
  siteDescriptionColor: text("site_description_color").default("#ffffff"),
  marqueeText: text("marquee_text").default(""),
  marqueeSpeed: integer("marquee_speed").default(10),
  marqueeColor: text("marquee_color").default("#ffffff"),
  marqueeBgColor: text("marquee_bg_color").default("#1e293b"),
  marqueeEnabled: boolean("marquee_enabled").default(false),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  provider: text("provider").notNull(),
  name: text("name").notNull(),
  deposit: text("deposit").notNull(),
  withdraw: text("withdraw").notNull(),
  bet: text("bet").notNull(),
  dateTime: text("date_time").notNull(),
  imageUrl: text("image_url").notNull(),
  iconUrl: text("icon_url"),
  iconUrl2: text("icon_url_2"),
  outlineColor: text("outline_color").default("#ffffff"),
  outlineColorEnd: text("outline_color_end").default("#ff0000"),
  isPublished: boolean("is_published").default(true),
  description: text("description").default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const buttons = pgTable("buttons", {
  id: serial("id").primaryKey(),
  label: text("label").notNull().default("Button"),
  url: text("url").notNull().default("#"),
  color: text("color").default("#3b82f6"),
  outlineColor: text("outline_color").default("#60a5fa"),
  width: integer("width").default(300),
  height: integer("height").default(48),
  sortOrder: integer("sort_order").default(0),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(true),
});

export const insertSettingsSchema = createInsertSchema(settings);
export const insertGameSchema = createInsertSchema(games).omit({ id: true, createdAt: true });
export const insertButtonSchema = createInsertSchema(buttons).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true });

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type SiteButton = typeof buttons.$inferSelect;
export type InsertButton = z.infer<typeof insertButtonSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
