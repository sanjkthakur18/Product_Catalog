import { useQuery } from "@tanstack/react-query";
import { ProductWithVariants, ProductType } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Store, Utensils, Shirt, Laptop } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductTypeFilter from "@/components/ProductTypeFilter";
import { useCatalog } from "@/contexts/CatalogContext";

const typeIcons = {
  food: Utensils,
  apparel: Shirt,
  electronics: Laptop,
};

export default function Catalog() {
  const { selectedProductType } = useCatalog();
  
  const { data: productTypes, isLoading: typesLoading } = useQuery<ProductType[]>({
    queryKey: ["/api/product-types"],
  });

  const { data: products, isLoading: productsLoading, error } = useQuery<ProductWithVariants[]>({
    queryKey: selectedProductType ? ["/api/products", selectedProductType] : ["/api/products"],
    queryFn: async ({ queryKey }) => {
      const url = selectedProductType 
        ? `/api/products?type=${selectedProductType}`
        : "/api/products";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return response.json();
    },
  });

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Error Loading Catalog</h2>
          <p className="text-slate-600">Please try again later</p>
        </div>
      </div>
    );
  }

  if (productsLoading || typesLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center">
                  <Store className="text-primary mr-2" />
                  CatalogPro
                </h1>
              </div>
              <div className="hidden md:flex space-x-8">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  const groupedProducts = productTypes?.reduce((acc, type) => {
    acc[type.id] = products?.filter(p => p.productTypeId === type.id) || [];
    return acc;
  }, {} as Record<string, ProductWithVariants[]>) || {};

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-slate-800 flex items-center">
                <Store className="text-primary mr-2" />
                CatalogPro
              </h1>
            </div>
            <ProductTypeFilter productTypes={productTypes || []} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Product Catalog</h2>
              <p className="text-slate-600">Discover our collection of products across different categories</p>
            </div>
          </div>
        </div>

        {!products?.length ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No Products Available</h3>
            <p className="text-slate-500">Check back later for new products</p>
          </div>
        ) : selectedProductType ? (
          <section className="mb-12">
            {(() => {
              const type = productTypes?.find(t => t.id === selectedProductType);
              const Icon = type ? typeIcons[type.name.toLowerCase() as keyof typeof typeIcons] || Store : Store;
              const typeProducts = groupedProducts[selectedProductType] || [];
              
              return (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <Icon className="text-2xl text-primary mr-3" />
                      <h3 className="text-2xl font-bold text-slate-800">{type?.name}</h3>
                      {type?.name.toLowerCase() === 'food' && (
                        <span className="ml-3 px-3 py-1 bg-accent text-white text-sm rounded-full">
                          Add-ons Available
                        </span>
                      )}
                    </div>
                    <span className="text-slate-500 text-sm">{typeProducts.length} products</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {typeProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              );
            })()}
          </section>
        ) : (
          productTypes?.map((type) => {
            const Icon = typeIcons[type.name.toLowerCase() as keyof typeof typeIcons] || Store;
            const typeProducts = groupedProducts[type.id] || [];
            
            if (typeProducts.length === 0) return null;
            
            return (
              <section key={type.id} className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Icon className="text-2xl text-primary mr-3" />
                    <h3 className="text-2xl font-bold text-slate-800">{type.name}</h3>
                    {type.name.toLowerCase() === 'food' && (
                      <span className="ml-3 px-3 py-1 bg-accent text-white text-sm rounded-full">
                        Add-ons Available
                      </span>
                    )}
                  </div>
                  <span className="text-slate-500 text-sm">{typeProducts.length} products</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {typeProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-slate-600">
            <p>&copy; 2024 CatalogPro. Product catalog system.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
