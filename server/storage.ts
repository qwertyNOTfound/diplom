import { users, properties, favorites, InsertUser, InsertProperty, InsertFavorite, User, Property, PropertyFilter } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { Store } from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User related
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;

  // Property related
  getProperty(id: number): Promise<Property | undefined>;
  getProperties(): Promise<Property[]>;
  getFilteredProperties(filters: PropertyFilter): Promise<Property[]>;
  getUserProperties(userId: number): Promise<Property[]>;
  getPendingProperties(): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, propertyData: Partial<Property>): Promise<Property>;
  deleteProperty(id: number): Promise<void>;

  // Favorites related
  getUserFavorites(userId: number): Promise<Property[]>;
  addFavorite(favorite: InsertFavorite): Promise<void>;
  removeFavorite(userId: number, propertyId: number): Promise<void>;
  isPropertyFavorite(userId: number, propertyId: number): Promise<boolean>;

  // Session store
  sessionStore: Store;
}

export class MemStorage implements IStorage {
  private userMap: Map<number, User>;
  private propertyMap: Map<number, Property>;
  private favoriteSet: Set<string>; // composite key: userId-propertyId
  sessionStore: Store;
  
  private userIdCounter: number;
  private propertyIdCounter: number;

  constructor() {
    this.userMap = new Map();
    this.propertyMap = new Map();
    this.favoriteSet = new Set();
    this.userIdCounter = 1;
    this.propertyIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });

    // Seed with an admin user
    this.createUser({
      username: "admin",
      email: "admin@vlasnaoselya.com",
      password: "mypassword", // In a real app, this would be hashed
      firstName: "Admin",
      lastName: "User",
      isAdmin: true,
      isVerified: true,
    } as InsertUser).catch(console.error);
  }

  // USER METHODS

  async getUser(id: number): Promise<User | undefined> {
    return this.userMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.userMap.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.userMap.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    
    const user: User = {
      ...userData,
      id,
      createdAt: now,
      isAdmin: userData.isAdmin || false,
      isVerified: userData.isVerified || false,
    };
    
    this.userMap.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    const updatedUser: User = { ...user, ...userData };
    this.userMap.set(id, updatedUser);
    return updatedUser;
  }

  // PROPERTY METHODS

  async getProperty(id: number): Promise<Property | undefined> {
    return this.propertyMap.get(id);
  }

  async getProperties(): Promise<Property[]> {
    // Return only approved properties
    return Array.from(this.propertyMap.values())
      .filter(property => property.approved);
  }

  async getFilteredProperties(filters: PropertyFilter): Promise<Property[]> {
    let properties = Array.from(this.propertyMap.values())
      .filter(property => property.approved);

    // Apply filters
    if (filters.listingType && filters.listingType !== 'all') {
      properties = properties.filter(p => p.listingType === filters.listingType);
    }

    if (filters.propertyType && filters.propertyType !== 'all') {
      properties = properties.filter(p => p.propertyType === filters.propertyType);
    }

    if (filters.region) {
      properties = properties.filter(p => 
        p.region.toLowerCase().includes(filters.region!.toLowerCase())
      );
    }

    if (filters.city) {
      properties = properties.filter(p => 
        p.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }

    if (filters.district) {
      properties = properties.filter(p => 
        p.district.toLowerCase().includes(filters.district!.toLowerCase())
      );
    }

    if (filters.priceMin) {
      const minPrice = parseInt(filters.priceMin);
      if (!isNaN(minPrice)) {
        properties = properties.filter(p => p.price >= minPrice);
      }
    }

    if (filters.priceMax) {
      const maxPrice = parseInt(filters.priceMax);
      if (!isNaN(maxPrice)) {
        properties = properties.filter(p => p.price <= maxPrice);
      }
    }

    if (filters.areaMin) {
      const minArea = parseInt(filters.areaMin);
      if (!isNaN(minArea)) {
        properties = properties.filter(p => p.area >= minArea);
      }
    }

    if (filters.areaMax) {
      const maxArea = parseInt(filters.areaMax);
      if (!isNaN(maxArea)) {
        properties = properties.filter(p => p.area <= maxArea);
      }
    }

    if (filters.rooms) {
      const rooms = parseInt(filters.rooms);
      if (!isNaN(rooms)) {
        properties = properties.filter(p => p.rooms === rooms);
      }
    }

    return properties;
  }

  async getUserProperties(userId: number): Promise<Property[]> {
    return Array.from(this.propertyMap.values())
      .filter(property => property.userId === userId);
  }

  async getPendingProperties(): Promise<Property[]> {
    return Array.from(this.propertyMap.values())
      .filter(property => !property.approved);
  }

  async createProperty(propertyData: InsertProperty): Promise<Property> {
    const id = this.propertyIdCounter++;
    const now = new Date();
    
    const property: Property = {
      ...propertyData,
      id,
      approved: false,
      createdAt: now,
    };
    
    this.propertyMap.set(id, property);
    return property;
  }

  async updateProperty(id: number, propertyData: Partial<Property>): Promise<Property> {
    const property = await this.getProperty(id);
    if (!property) {
      throw new Error(`Property with ID ${id} not found`);
    }

    const updatedProperty: Property = { ...property, ...propertyData };
    this.propertyMap.set(id, updatedProperty);
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<void> {
    if (!this.propertyMap.delete(id)) {
      throw new Error(`Property with ID ${id} not found`);
    }
    
    // Remove any favorites associated with this property
    Array.from(this.favoriteSet)
      .filter(key => key.endsWith(`-${id}`))
      .forEach(key => this.favoriteSet.delete(key));
  }

  // FAVORITES METHODS

  async getUserFavorites(userId: number): Promise<Property[]> {
    const favoritePropertyIds = Array.from(this.favoriteSet)
      .filter(key => key.startsWith(`${userId}-`))
      .map(key => parseInt(key.split('-')[1]));
    
    return favoritePropertyIds
      .map(id => this.propertyMap.get(id))
      .filter((p): p is Property => p !== undefined && p.approved);
  }

  async addFavorite(favorite: InsertFavorite): Promise<void> {
    const key = `${favorite.userId}-${favorite.propertyId}`;
    this.favoriteSet.add(key);
  }

  async removeFavorite(userId: number, propertyId: number): Promise<void> {
    const key = `${userId}-${propertyId}`;
    this.favoriteSet.delete(key);
  }

  async isPropertyFavorite(userId: number, propertyId: number): Promise<boolean> {
    const key = `${userId}-${propertyId}`;
    return this.favoriteSet.has(key);
  }
}

// Export a singleton instance of the storage
export const storage = new MemStorage();
