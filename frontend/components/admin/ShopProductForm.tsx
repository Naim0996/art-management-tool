import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';

interface ShopProductFormData {
  slug: string;
  title: string;
  short_description: string;
  long_description: string;
  base_price: number;
  currency: string;
  sku: string;
  gtin: string;
  character_value: string;
  etsy_link: string;
  status: 'published' | 'draft' | 'archived';
}

interface ShopProductFormProps {
  formData: ShopProductFormData;
  onChange: (formData: ShopProductFormData) => void;
}

const statusOptions = [
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' },
];

const currencyOptions = [
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'USD ($)', value: 'USD' },
];

export default function ShopProductForm({ formData, onChange }: ShopProductFormProps) {
  const updateField = (field: keyof ShopProductFormData, value: unknown) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <InputText
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Slug <span className="text-red-500">*</span>
          </label>
          <InputText
            value={formData.slug}
            onChange={(e) => updateField('slug', e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Short Description</label>
        <InputTextarea
          value={formData.short_description}
          onChange={(e) => updateField('short_description', e.target.value)}
          rows={2}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Long Description (Markdown)</label>
        <InputTextarea
          value={formData.long_description}
          onChange={(e) => updateField('long_description', e.target.value)}
          rows={4}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            SKU <span className="text-red-500">*</span>
          </label>
          <InputText
            value={formData.sku}
            onChange={(e) => updateField('sku', e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">GTIN</label>
          <InputText
            value={formData.gtin}
            onChange={(e) => updateField('gtin', e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Currency</label>
          <Dropdown
            value={formData.currency}
            options={currencyOptions}
            onChange={(e) => updateField('currency', e.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Base Price</label>
          <InputNumber
            value={formData.base_price}
            onValueChange={(e) => updateField('base_price', e.value || 0)}
            mode="decimal"
            minFractionDigits={2}
            maxFractionDigits={2}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <Dropdown
            value={formData.status}
            options={statusOptions}
            onChange={(e) => updateField('status', e.value)}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Character Value</label>
        <InputText
          value={formData.character_value}
          onChange={(e) => updateField('character_value', e.target.value)}
          placeholder="Nome del personaggio (es: Leon, Il Giullare)"
          className="w-full"
        />
        <small className="text-gray-500">Usato per filtrare i prodotti per personaggio</small>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Etsy Link</label>
        <InputText
          value={formData.etsy_link}
          onChange={(e) => updateField('etsy_link', e.target.value)}
          placeholder="https://www.etsy.com/listing/..."
          className="w-full"
        />
      </div>
    </div>
  );
}
