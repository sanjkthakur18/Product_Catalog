import { Variant } from "@shared/schema";
import { useCatalog } from "@/contexts/CatalogContext";
import { useEffect } from "react";

interface VariantSelectorProps {
  variants: Variant[];
  onPriceChange: (price: number) => void;
}

export default function VariantSelector({ variants, onPriceChange }: VariantSelectorProps) {
  const { selectedVariants, setSelectedVariants } = useCatalog();

  useEffect(() => {
    if (variants.length > 0 && Object.keys(selectedVariants).length === 0) {
      const firstVariant = variants[0];
      const price = parseFloat(firstVariant.price);
      setSelectedVariants({
        default: {
          value: firstVariant.name,
          price: price,
          variant: firstVariant,
        },
      });
      onPriceChange(price);
    }
  }, [variants, selectedVariants, setSelectedVariants, onPriceChange]);

  const handleVariantSelect = (variant: Variant) => {
    const price = parseFloat(variant.price);
    setSelectedVariants({
      default: {
        value: variant.name,
        price: price,
        variant: variant,
      },
    });
    onPriceChange(price);
  };

  if (variants.length <= 1) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-slate-800">Select Options</h3>
      
      <div className="variant-group">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Available Options
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {variants.map((variant) => {
            const isSelected = selectedVariants.default?.variant.id === variant.id;
            return (
              <button
                key={variant.id}
                onClick={() => handleVariantSelect(variant)}
                className={`p-3 border-2 rounded-lg font-medium transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  isSelected
                    ? "border-primary text-primary bg-primary bg-opacity-10"
                    : "border-slate-300 text-slate-700 hover:border-slate-400"
                }`}
              >
                <div className="text-sm font-medium">{variant.name}</div>
                <div className="text-sm text-slate-600">${parseFloat(variant.price).toFixed(2)}</div>
                <div className="text-xs text-slate-500">
                  {variant.stock > 0 ? `${variant.stock} available` : 'Out of stock'}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
