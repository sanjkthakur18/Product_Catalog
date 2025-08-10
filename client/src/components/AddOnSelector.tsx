import { AddOn } from "@shared/schema";
import { useCatalog } from "@/contexts/CatalogContext";
import { Plus } from "lucide-react";

interface AddOnSelectorProps {
  addOns: AddOn[];
}

export default function AddOnSelector({ addOns }: AddOnSelectorProps) {
  const { selectedAddOns, setSelectedAddOns } = useCatalog();

  const handleAddOnToggle = (addOn: AddOn) => {
    const isSelected = selectedAddOns.some(selected => selected.id === addOn.id);
    
    if (isSelected) {
      setSelectedAddOns(selectedAddOns.filter(selected => selected.id !== addOn.id));
    } else {
      setSelectedAddOns([
        ...selectedAddOns,
        {
          id: addOn.id,
          name: addOn.name,
          price: parseFloat(addOn.price),
        },
      ]);
    }
  };

  if (!addOns.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-slate-800 flex items-center">
        <Plus className="text-accent mr-2" />
        Customize Your Order
      </h3>
      <p className="text-sm text-slate-600">Select additional options to customize your product</p>
      
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
        {addOns.map((addOn) => {
          const isSelected = selectedAddOns.some(selected => selected.id === addOn.id);
          
          return (
            <div
              key={addOn.id}
              className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0"
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleAddOnToggle(addOn)}
                  className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary focus:ring-2"
                  id={`addon-${addOn.id}`}
                />
                <label htmlFor={`addon-${addOn.id}`} className="ml-3 cursor-pointer">
                  <div className="font-medium text-slate-800">{addOn.name}</div>
                  {addOn.description && (
                    <div className="text-sm text-slate-600">{addOn.description}</div>
                  )}
                </label>
              </div>
              <span className="font-semibold text-slate-800">
                +${parseFloat(addOn.price).toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
