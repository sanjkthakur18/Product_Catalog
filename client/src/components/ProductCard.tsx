import { Link } from "wouter";
import { ProductWithVariants } from "@shared/schema";
import { Package, Plus } from "lucide-react";

interface ProductCardProps {
  product: ProductWithVariants;
}

export default function ProductCard({ product }: ProductCardProps) {
  const minPrice = product.variants.length > 0 
    ? Math.min(...product.variants.map(v => parseFloat(v.price)))
    : 0;

  const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
  const isFoodItem = product.productType.name.toLowerCase() === 'food';

  return (
    <Link href={`/product/${product.id}`}>
      <div className="product-card bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer">
        <img
          src={product.images?.[0] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-slate-800">{product.name}</h4>
            {isFoodItem && (
              <div className="flex items-center">
                <Plus className="text-accent text-sm mr-1" />
                <span className="text-xs text-accent font-medium">Add-ons</span>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-600 mb-3 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">
              {product.variants.length > 1 ? `From $${minPrice.toFixed(2)}` : `$${minPrice.toFixed(2)}`}
            </span>
            <div className="flex items-center text-sm text-slate-500">
              <Package className="text-xs mr-1" />
              <span>{totalStock} in stock</span>
            </div>
          </div>
          {product.variants.length > 1 && (
            <div className="mt-3 flex items-center space-x-2">
              <span className="text-xs text-slate-500">Variants:</span>
              <div className="flex space-x-1">
                {product.variants.slice(0, 3).map((variant, index) => (
                  <span key={index} className="px-2 py-1 bg-slate-100 text-xs rounded">
                    {variant.attributes?.size || variant.attributes?.color || variant.name}
                  </span>
                ))}
                {product.variants.length > 3 && (
                  <span className="px-2 py-1 bg-slate-100 text-xs rounded">
                    +{product.variants.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
