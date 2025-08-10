import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProductTypeSchema,
  insertProductSchema,
  insertVariantSchema,
  insertAddOnSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/product-types", async (req, res) => {
    try {
      const productTypes = await storage.getProductTypes();
      res.json(productTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product types" });
    }
  });

  app.post("/api/product-types", async (req, res) => {
    try {
      const productType = insertProductTypeSchema.parse(req.body);
      const created = await storage.createProductType(productType);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid product type data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create product type" });
      }
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const { type } = req.query;
      
      if (type && typeof type === 'string') {
        const products = await storage.getProductsByType(type);
        res.json(products);
      } else {
        const products = await storage.getProducts();
        res.json(products);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const product = insertProductSchema.parse(req.body);
      const created = await storage.createProduct(product);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create product" });
      }
    }
  });

  app.post("/api/variants", async (req, res) => {
    try {
      const variant = insertVariantSchema.parse(req.body);
      const created = await storage.createVariant(variant);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid variant data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create variant" });
      }
    }
  });

  app.get("/api/add-ons/:productTypeId", async (req, res) => {
    try {
      const addOns = await storage.getAddOnsByProductTypeId(req.params.productTypeId);
      res.json(addOns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch add-ons" });
    }
  });

  app.post("/api/add-ons", async (req, res) => {
    try {
      const addOn = insertAddOnSchema.parse(req.body);
      const created = await storage.createAddOn(addOn);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid add-on data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create add-on" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
