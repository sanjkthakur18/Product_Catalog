import { 
  productTypes, 
  products, 
  variants, 
  addOns,
  type ProductType, 
  type Product, 
  type Variant,
  type AddOn,
  type InsertProductType, 
  type InsertProduct, 
  type InsertVariant,
  type InsertAddOn,
  type ProductWithVariants,
  type ProductTypeWithAddOns
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Product Types
  getProductTypes(): Promise<ProductType[]>;
  getProductTypeById(id: string): Promise<ProductType | undefined>;
  createProductType(productType: InsertProductType): Promise<ProductType>;

  // Products
  getProducts(): Promise<ProductWithVariants[]>;
  getProductsByType(productTypeId: string): Promise<ProductWithVariants[]>;
  getProductById(id: string): Promise<ProductWithVariants | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Variants
  getVariantsByProductId(productId: string): Promise<Variant[]>;
  createVariant(variant: InsertVariant): Promise<Variant>;

  // Add-ons
  getAddOnsByProductTypeId(productTypeId: string): Promise<AddOn[]>;
  createAddOn(addOn: InsertAddOn): Promise<AddOn>;
}

export class DatabaseStorage implements IStorage {
  async getProductTypes(): Promise<ProductType[]> {
    return await db.select().from(productTypes);
  }

  async getProductTypeById(id: string): Promise<ProductType | undefined> {
    const [productType] = await db.select().from(productTypes).where(eq(productTypes.id, id));
    return productType || undefined;
  }

  async createProductType(insertProductType: InsertProductType): Promise<ProductType> {
    const [productType] = await db
      .insert(productTypes)
      .values(insertProductType)
      .returning();
    return productType;
  }

  async getProducts(): Promise<ProductWithVariants[]> {
    const result = await db
      .select()
      .from(products)
      .leftJoin(variants, eq(products.id, variants.productId))
      .leftJoin(productTypes, eq(products.productTypeId, productTypes.id))
      .orderBy(desc(products.name));

    const productsMap = new Map<string, ProductWithVariants>();
    
    for (const row of result) {
      const product = row.products;
      const variant = row.variants;
      const productType = row.product_types!;

      if (!productsMap.has(product.id)) {
        productsMap.set(product.id, {
          ...product,
          variants: [],
          productType: productType,
        });
      }

      if (variant) {
        productsMap.get(product.id)!.variants.push(variant);
      }
    }

    return Array.from(productsMap.values());
  }

  async getProductsByType(productTypeId: string): Promise<ProductWithVariants[]> {
    const result = await db
      .select()
      .from(products)
      .leftJoin(variants, eq(products.id, variants.productId))
      .leftJoin(productTypes, eq(products.productTypeId, productTypes.id))
      .where(eq(products.productTypeId, productTypeId))
      .orderBy(desc(products.name));

    const productsMap = new Map<string, ProductWithVariants>();
    
    for (const row of result) {
      const product = row.products;
      const variant = row.variants;
      const productType = row.product_types!;

      if (!productsMap.has(product.id)) {
        productsMap.set(product.id, {
          ...product,
          variants: [],
          productType: productType,
        });
      }

      if (variant) {
        productsMap.get(product.id)!.variants.push(variant);
      }
    }

    return Array.from(productsMap.values());
  }

  async getProductById(id: string): Promise<ProductWithVariants | undefined> {
    const result = await db
      .select()
      .from(products)
      .leftJoin(variants, eq(products.id, variants.productId))
      .leftJoin(productTypes, eq(products.productTypeId, productTypes.id))
      .where(eq(products.id, id));

    if (result.length === 0) {
      return undefined;
    }

    const product = result[0].products;
    const productType = result[0].product_types!;
    const productVariants = result
      .filter(row => row.variants !== null)
      .map(row => row.variants!);

    return {
      ...product,
      variants: productVariants,
      productType: productType,
    };
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async getVariantsByProductId(productId: string): Promise<Variant[]> {
    return await db.select().from(variants).where(eq(variants.productId, productId));
  }

  async createVariant(insertVariant: InsertVariant): Promise<Variant> {
    const [variant] = await db
      .insert(variants)
      .values(insertVariant)
      .returning();
    return variant;
  }

  async getAddOnsByProductTypeId(productTypeId: string): Promise<AddOn[]> {
    return await db
      .select()
      .from(addOns)
      .where(eq(addOns.productTypeId, productTypeId));
  }

  async createAddOn(insertAddOn: InsertAddOn): Promise<AddOn> {
    const [addOn] = await db
      .insert(addOns)
      .values(insertAddOn)
      .returning();
    return addOn;
  }
}

export const storage = new DatabaseStorage();
