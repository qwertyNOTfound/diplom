import { pgTable, text, serial, integer, boolean, primaryKey, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  middleName: text("middle_name"),
  phoneNumber: text("phone_number"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationCode: text("verification_code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  propertyType: text("property_type").notNull(), // apartment, house, etc.
  listingType: text("listing_type").notNull(), // sale or rent
  region: text("region").notNull(),
  city: text("city").notNull(),
  district: text("district").notNull(),
  address: text("address").notNull(),
  area: integer("area").notNull(), // square meters
  rooms: integer("rooms").notNull(),
  photos: jsonb("photos").notNull().$type<string[]>(),
  approved: boolean("approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const favorites = pgTable("favorites", {
  userId: integer("user_id").notNull().references(() => users.id),
  propertyId: integer("property_id").notNull().references(() => properties.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.propertyId] })
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  isAdmin: true,
  createdAt: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  approved: true,
  createdAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites);

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

// Search filter schema
export const propertyFilterSchema = z.object({
  listingType: z.enum(['sale', 'rent', 'all']).optional(),
  propertyType: z.enum(['apartment', 'house', 'all']).optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  priceMin: z.string().optional(),
  priceMax: z.string().optional(),
  areaMin: z.string().optional(),
  areaMax: z.string().optional(),
  rooms: z.string().optional(),
});

export type PropertyFilter = z.infer<typeof propertyFilterSchema>;

// Email verification schema
export const verificationSchema = z.object({
  email: z.string().email(),
  code: z.string().min(6).max(6),
});

export type VerificationData = z.infer<typeof verificationSchema>;
