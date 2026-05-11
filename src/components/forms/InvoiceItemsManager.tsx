import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus } from 'lucide-react';
import { formatXAF } from '@/data/mockData';

interface InvoiceItem {
  description: string;
  detailedDescription?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceItemsManagerProps {
  items: InvoiceItem[];
  onChange: (items: InvoiceItem[]) => void;
  onFocus?: (field: string) => void;
  onBlur?: (field: string) => void;
}

const InvoiceItemsManager = ({ items, onChange, onFocus, onBlur }: InvoiceItemsManagerProps) => {
  const handleAddItem = () => {
    onChange([
      ...items,
      { description: '', detailedDescription: '', quantity: 1, unitPrice: 0, total: 0 }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate total for this item
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    onChange(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Articles de la facture</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddItem}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter un article
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">Aucun article ajouté</p>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddItem}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter le premier article
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Items */}
          {items.map((item, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="grid grid-cols-12 gap-3 items-start">
                <div className="col-span-5">
                  <Label className="text-xs text-gray-600">Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    onFocus={() => onFocus?.(`items.${index}.description`)}
                    onBlur={() => onBlur?.(`items.${index}.description`)}
                    placeholder="Description de l'article"
                    className="bg-white mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-gray-600">Quantité</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    onFocus={() => onFocus?.(`items.${index}.quantity`)}
                    onBlur={() => onBlur?.(`items.${index}.quantity`)}
                    min="0.01"
                    step="0.01"
                    className="bg-white mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-gray-600">Prix unitaire</Label>
                  <Input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    onFocus={() => onFocus?.(`items.${index}.unitPrice`)}
                    onBlur={() => onBlur?.(`items.${index}.unitPrice`)}
                    min="0"
                    step="0.01"
                    className="bg-white mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-gray-600">Total</Label>
                  <div className="flex items-center h-10 mt-1">
                    <span className="font-medium text-gray-900">
                      {formatXAF(item.total)}
                    </span>
                  </div>
                </div>
                <div className="col-span-1 flex items-end justify-center pb-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Detailed Description */}
              <div>
                <Label className="text-xs text-gray-600">
                  Description détaillée (optionnel)
                  {item.detailedDescription && (
                    <span className="ml-2 text-gray-500">
                      {item.detailedDescription.length}/1000 caractères
                    </span>
                  )}
                </Label>
                <Textarea
                  value={item.detailedDescription || ''}
                  onChange={(e) => handleItemChange(index, 'detailedDescription', e.target.value)}
                  onFocus={() => onFocus?.(`items.${index}.detailedDescription`)}
                  onBlur={() => onBlur?.(`items.${index}.detailedDescription`)}
                  placeholder="Ajoutez des détails supplémentaires (chaque ligne sera affichée avec un tiret)"
                  className="bg-white mt-1 min-h-[80px]"
                  maxLength={1000}
                />
                {item.detailedDescription && item.detailedDescription.length > 1000 && (
                  <p className="text-xs text-red-600 mt-1">
                    Description trop longue (max 1000 caractères)
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Subtotal */}
          <div className="flex justify-end pt-4 border-t">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total HT:</span>
                <span className="font-semibold">{formatXAF(calculateSubtotal())}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceItemsManager;
