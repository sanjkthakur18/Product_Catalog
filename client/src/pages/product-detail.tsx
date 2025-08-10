import { useQuery, queryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Link } from "wouter";
import { ProductWithVariants, AddOn } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Package, Heart, Share } from "lucide-react";
import VariantSelector from "@/components/VariantSelector";
import AddOnSelector from "@/components/AddOnSelector";
import { useCatalog } from "@/contexts/CatalogContext";
import { useState, useEffect } from "react";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const productId = params?.id;
  const { selectedVariants, selectedAddOns, calculateTotalPrice } = useCatalog();
  const [basePrice, setBasePrice] = useState(0);

  const { data: product, isLoading, error } = useQuery<ProductWithVariants>({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
  });

  const { data: addOns } = useQuery<AddOn[]>({
    queryKey: ["/api/add-ons", product?.productTypeId],
    enabled: !!product?.productTypeId,
  });

  useEffect(() => {
    if (product?.variants?.length && !basePrice) {
      setBasePrice(parseFloat(product.variants[0].price));
    }
  }, [product, basePrice]);

  const currentPrice = calculateTotalPrice(basePrice, selectedVariants, selectedAddOns);

  const currentVariant = Object.values(selectedVariants)[0]?.variant || product?.variants?.[0];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Error Loading Product</h2>
          <p className="text-slate-600 mb-4">Product not found or failed to load</p>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !product) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isFoodItem = product.productType.name.toLowerCase() === 'food';
  const hasAddOns = isFoodItem && addOns && addOns.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-slate-200 bg-white">
        <nav className="flex items-center space-x-2 text-sm">
          <Link href="/" className="text-slate-500 hover:text-primary">
            Catalog
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-700 font-medium">{product.productType.name}</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-700 font-medium">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8">
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-white shadow-sm">
              <img
                src={product.images?.[0] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=800&fit=crop"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.name} ${index + 2}`}
                    className="aspect-square rounded-lg object-cover cursor-pointer hover:opacity-75 transition-opacity"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="px-3 py-1 bg-primary text-white text-sm rounded-full">
                  {product.productType.name}
                </span>
                {hasAddOns && (
                  <span className="px-3 py-1 bg-accent text-white text-sm rounded-full flex items-center">
                    <span className="mr-1">+</span>
                    Add-ons Available
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">{product.name}</h1>
              <p className="text-slate-600 text-lg">{product.description}</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-bold text-primary">
                    ${currentPrice.toFixed(2)}
                  </span>
                  <span className="text-slate-500 ml-2 text-sm">
                    {selectedAddOns.length > 0 ? 'Total Price' : 'Base Price'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500">Stock Available</div>
                  <div className="font-semibold text-slate-800">
                    {currentVariant?.stock || 0} units
                  </div>
                </div>
              </div>
            </div>

            {product.variants && product.variants.length > 0 && (
              <VariantSelector 
                variants={product.variants} 
                onPriceChange={setBasePrice}
              />
            )}

            {hasAddOns && addOns && (
              <AddOnSelector addOns={addOns} />
            )}

            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-800 mb-3">Product Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">SKU:</span>
                  <span className="font-medium text-slate-800 ml-2">
                    {currentVariant?.sku || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Category:</span>
                  <span className="font-medium text-slate-800 ml-2">
                    {product.productType.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Availability:</span>
                  <span className="font-medium text-secondary ml-2">
                    {(currentVariant?.stock || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Product ID:</span>
                  <span className="font-medium text-slate-800 ml-2 text-xs">
                    {product.id}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button 
                className="flex-1 bg-primary text-white hover:bg-blue-700" 
                size="lg"
                disabled={(currentVariant?.stock || 0) === 0}
              >
                <Package className="mr-2 h-4 w-4" />
                View Details - ${currentPrice.toFixed(2)}
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Catalog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
