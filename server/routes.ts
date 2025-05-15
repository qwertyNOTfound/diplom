import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { propertyFilterSchema } from "@shared/schema";

function checkAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Authentication required" });
}

function checkAdmin(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }
  return res.status(403).json({ message: "Admin access required" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // === Property Routes ===
  
  // Get all properties (with optional filters)
  app.get("/api/properties", async (req, res) => {
    try {
      const filterParams = propertyFilterSchema.parse(req.query);
      const properties = await storage.getFilteredProperties(filterParams);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // Get a specific property by ID
  app.get("/api/properties/:id", async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Only return approved properties unless the user is the owner or an admin
      if (!property.approved &&
          (!req.isAuthenticated() || 
           (req.user.id !== property.userId && !req.user.isAdmin))) {
        return res.status(403).json({ message: "This property listing is not approved yet" });
      }

      res.json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  // Create a new property listing
  app.post("/api/properties", checkAuthenticated, async (req, res) => {
    try {
      if (!req.user.isVerified) {
        return res.status(403).json({ message: "Email verification required to create listings" });
      }

      const propertyData = {
        ...req.body,
        userId: req.user.id
      };

      const newProperty = await storage.createProperty(propertyData);
      res.status(201).json(newProperty);
    } catch (error) {
      console.error("Error creating property:", error);
      res.status(500).json({ message: "Failed to create property listing" });
    }
  });

  // Update a property
  app.put("/api/properties/:id", checkAuthenticated, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Check if the user is the owner or an admin
      if (property.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to update this property" });
      }

      // If a regular user updates a property, reset approval
      const updateData = { ...req.body };
      if (!req.user.isAdmin) {
        updateData.approved = false;
      }

      const updatedProperty = await storage.updateProperty(propertyId, updateData);
      res.json(updatedProperty);
    } catch (error) {
      console.error("Error updating property:", error);
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  // Delete a property
  app.delete("/api/properties/:id", checkAuthenticated, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Check if the user is the owner or an admin
      if (property.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "You don't have permission to delete this property" });
      }

      await storage.deleteProperty(propertyId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Get user's properties
  app.get("/api/user/properties", checkAuthenticated, async (req, res) => {
    try {
      const properties = await storage.getUserProperties(req.user.id);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching user properties:", error);
      res.status(500).json({ message: "Failed to fetch user properties" });
    }
  });

  // === Admin Routes ===
  
  // Get all pending properties
  app.get("/api/admin/pending-properties", checkAdmin, async (req, res) => {
    try {
      const pendingProperties = await storage.getPendingProperties();
      res.json(pendingProperties);
    } catch (error) {
      console.error("Error fetching pending properties:", error);
      res.status(500).json({ message: "Failed to fetch pending properties" });
    }
  });

  // Approve a property
  app.post("/api/admin/properties/:id/approve", checkAdmin, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      const updatedProperty = await storage.updateProperty(propertyId, { approved: true });
      res.json(updatedProperty);
    } catch (error) {
      console.error("Error approving property:", error);
      res.status(500).json({ message: "Failed to approve property" });
    }
  });

  // Reject a property
  app.post("/api/admin/properties/:id/reject", checkAdmin, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      await storage.deleteProperty(propertyId);
      res.status(204).send();
    } catch (error) {
      console.error("Error rejecting property:", error);
      res.status(500).json({ message: "Failed to reject property" });
    }
  });

  // === Favorites Routes ===
  
  // Get user's favorite properties
  app.get("/api/favorites", checkAuthenticated, async (req, res) => {
    try {
      const favorites = await storage.getUserFavorites(req.user.id);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // Add a property to favorites
  app.post("/api/favorites/:propertyId", checkAuthenticated, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      const property = await storage.getProperty(propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      await storage.addFavorite({ userId: req.user.id, propertyId });
      res.status(201).json({ message: "Property added to favorites" });
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add property to favorites" });
    }
  });

  // Remove a property from favorites
  app.delete("/api/favorites/:propertyId", checkAuthenticated, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      await storage.removeFavorite(req.user.id, propertyId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove property from favorites" });
    }
  });

  // Check if a property is in user's favorites
  app.get("/api/favorites/:propertyId", checkAuthenticated, async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      if (isNaN(propertyId)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      const isFavorite = await storage.isPropertyFavorite(req.user.id, propertyId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite status:", error);
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
