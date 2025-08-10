import { createContext, useContext, useState, ReactNode } from "react";
import { ProductWithVariants, ProductType, AddOn, Variant } from "@shared/schema";

interface SelectedVariant {
  [key: string]: {
    value: string;
    price: number;
    variant: Variant;
  };
}

interface SelectedAddOn {
  id: string;
  name: string;
  price: number;
}

interface CatalogContextType {
  selectedProductType: string | null;
  setSelectedProductType: (typeId: string | null) => void;
  
  selectedVariants: SelectedVariant;
  setSelectedVariants: (variants: SelectedVariant) => void;
  
  selectedAddOns: SelectedAddOn[];
  setSelectedAddOns: (addOns: SelectedAddOn[]) => void;
  
  calculateTotalPrice: (basePrice: number, selectedVariants: SelectedVariant, selectedAddOns: SelectedAddOn[]) => number;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [selectedProductType, setSelectedProductType] = useState<string | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<SelectedVariant>({});
  const [selectedAddOns, setSelectedAddOns] = useState<SelectedAddOn[]>([]);

  const calculateTotalPrice = (
    basePrice: number,
    variants: SelectedVariant,
    addOns: SelectedAddOn[]
  ): number => {
    let total = basePrice;
    
    Object.values(variants).forEach(variant => {
      total = variant.price;
    });
    
    addOns.forEach(addOn => {
      total += addOn.price;
    });
    
    return total;
  };

  return (
    <CatalogContext.Provider
      value={{
        selectedProductType,
        setSelectedProductType,
        selectedVariants,
        setSelectedVariants,
        selectedAddOns,
        setSelectedAddOns,
        calculateTotalPrice,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (context === undefined) {
    throw new Error("useCatalog must be used within a CatalogProvider");
  }
  return context;
}
