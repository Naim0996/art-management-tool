import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { CategoryDTO } from '@/services/CategoryAPIService';

interface CategoryFormProps {
  formData: Partial<CategoryDTO>;
  onChange: (updates: Partial<CategoryDTO>) => void;
  parentOptions: { label: string; value: number | null }[];
}

export default function CategoryForm({ formData, onChange, parentOptions }: CategoryFormProps) {
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    onChange({
      name,
      slug: generateSlug(name),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <InputText
          id="name"
          value={formData.name || ''}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full"
          placeholder="Category name"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
          Slug *
        </label>
        <InputText
          id="slug"
          value={formData.slug || ''}
          onChange={(e) => onChange({ slug: e.target.value })}
          className="w-full"
          placeholder="category-slug"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <InputTextarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          className="w-full"
          placeholder="Category description"
        />
      </div>

      <div>
        <label htmlFor="parent" className="block text-sm font-medium text-gray-700 mb-1">
          Parent Category
        </label>
        <Dropdown
          id="parent"
          value={formData.parent_id}
          options={parentOptions}
          onChange={(e) => onChange({ parent_id: e.value })}
          className="w-full"
          placeholder="Select parent category"
        />
      </div>
    </div>
  );
}
