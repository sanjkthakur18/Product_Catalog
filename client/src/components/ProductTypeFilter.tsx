import { ProductType } from "@shared/schema";
import { useCatalog } from "@/contexts/CatalogContext";

interface ProductTypeFilterProps {
  productTypes: ProductType[];
}

export default function ProductTypeFilter({ productTypes }: ProductTypeFilterProps) {
  const { selectedProductType, setSelectedProductType } = useCatalog();

  return (
    <nav className="hidden md:flex space-x-8">
      <button
        onClick={() => setSelectedProductType(null)}
        className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
          selectedProductType === null
            ? "text-primary border-primary"
            : "text-slate-600 hover:text-primary border-transparent hover:border-primary"
        }`}
      >
        All Products
      </button>
      {productTypes.map((type) => (
        <button
          key={type.id}
          onClick={() => setSelectedProductType(type.id)}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            selectedProductType === type.id
              ? "text-primary border-primary"
              : "text-slate-600 hover:text-primary border-transparent hover:border-primary"
          }`}
        >
          {type.name}
        </button>
      ))}
    </nav>
  );
}
