import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
}

interface ProductFormProps {
  formData: ProductFormData;
  onChange: (data: ProductFormData) => void;
}

export function ProductForm({ formData, onChange }: ProductFormProps) {
  const handleChange = (field: keyof ProductFormData, value: string | number) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="font-semibold">
          Name *
        </label>
        <InputText
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter product name"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="description" className="font-semibold">
          Description
        </label>
        <InputTextarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={5}
          placeholder="Enter product description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="price" className="font-semibold">
            Price ($)
          </label>
          <InputNumber
            id="price"
            value={formData.price}
            onValueChange={(e) => handleChange('price', e.value || 0)}
            mode="currency"
            currency="USD"
            locale="en-US"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="stock" className="font-semibold">
            Stock
          </label>
          <InputNumber
            id="stock"
            value={formData.stock}
            onValueChange={(e) => handleChange('stock', e.value || 0)}
            placeholder="Stock quantity"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="image_url" className="font-semibold">
          Image URL
        </label>
        <InputText
          id="image_url"
          value={formData.image_url}
          onChange={(e) => handleChange('image_url', e.target.value)}
          placeholder="Enter image URL"
        />
      </div>
    </div>
  );
}
