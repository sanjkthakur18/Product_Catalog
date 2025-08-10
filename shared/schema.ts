import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const productTypes = pgTable("product_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  productTypeId: varchar("product_type_id").notNull().references(() => productTypes.id),
  images: jsonb("images").$type<string[]>().default([]),
});

export const variants = pgTable("variants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  sku: text("sku").notNull().unique(),
  attributes: jsonb("attributes").$type<Record<string, string>>().default({}),
});

export const addOns = pgTable("add_ons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productTypeId: varchar("product_type_id").notNull().references(() => productTypes.id),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  available: boolean("available").notNull().default(true),
});

// Relations
export const productTypesRelations = relations(productTypes, ({ many }) => ({
  products: many(products),
  addOns: many(addOns),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  productType: one(productTypes, {
    fields: [products.productTypeId],
    references: [productTypes.id],
  }),
  variants: many(variants),
}));

export const variantsRelations = relations(variants, ({ one }) => ({
  product: one(products, {
    fields: [variants.productId],
    references: [products.id],
  }),
}));

export const addOnsRelations = relations(addOns, ({ one }) => ({
  productType: one(productTypes, {
    fields: [addOns.productTypeId],
    references: [productTypes.id],
  }),
}));

// Insert schemas
export const insertProductTypeSchema = createInsertSchema(productTypes).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertVariantSchema = createInsertSchema(variants).omit({
  id: true,
});

export const insertAddOnSchema = createInsertSchema(addOns).omit({
  id: true,
});

// Types
export type InsertProductType = z.infer<typeof insertProductTypeSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertVariant = z.infer<typeof insertVariantSchema>;
export type InsertAddOn = z.infer<typeof insertAddOnSchema>;

export type ProductType = typeof productTypes.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Variant = typeof variants.$inferSelect;
export type AddOn = typeof addOns.$inferSelect;

// Extended types with relations
export type ProductWithVariants = Product & {
  variants: Variant[];
  productType: ProductType;
};

export type ProductTypeWithAddOns = ProductType & {
  addOns: AddOn[];
};
