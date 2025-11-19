import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { Calendar } from 'primereact/calendar';
import { DiscountDTO } from '@/services/DiscountAPIService';

interface DiscountFormProps {
  formData: Partial<DiscountDTO>;
  onChange: (updates: Partial<DiscountDTO>) => void;
}

const discountTypeOptions = [
  { label: 'Percentage', value: 'percentage' },
  { label: 'Fixed Amount', value: 'fixed_amount' },
];

export default function DiscountForm({ formData, onChange }: DiscountFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
            Discount Code *
          </label>
          <InputText
            id="code"
            value={formData.code || ''}
            onChange={(e) => onChange({ code: e.target.value.toUpperCase() })}
            className="w-full font-mono"
            placeholder="SUMMER2025"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Discount Type *
          </label>
          <Dropdown
            id="type"
            value={formData.type}
            options={discountTypeOptions}
            onChange={(e) => onChange({ type: e.value })}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
            Value * {formData.type === 'percentage' ? '(%)' : '(€)'}
          </label>
          <InputNumber
            id="value"
            value={formData.value || 0}
            onValueChange={(e) => onChange({ value: e.value || 0 })}
            mode={formData.type === 'fixed_amount' ? 'currency' : 'decimal'}
            currency="EUR"
            locale="en-US"
            min={0}
            max={formData.type === 'percentage' ? 100 : undefined}
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="minPurchase" className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Purchase (€)
          </label>
          <InputNumber
            id="minPurchase"
            value={formData.min_purchase || 0}
            onValueChange={(e) => onChange({ min_purchase: e.value || 0 })}
            mode="currency"
            currency="EUR"
            locale="en-US"
            min={0}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <label htmlFor="maxUses" className="block text-sm font-medium text-gray-700 mb-1">
          Maximum Uses (leave empty for unlimited)
        </label>
        <InputNumber
          id="maxUses"
          value={formData.max_uses || undefined}
          onValueChange={(e) => onChange({ max_uses: e.value || null })}
          min={1}
          className="w-full"
          placeholder="Unlimited"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startsAt" className="block text-sm font-medium text-gray-700 mb-1">
            Starts At
          </label>
          <Calendar
            id="startsAt"
            value={formData.starts_at ? new Date(formData.starts_at) : null}
            onChange={(e) => onChange({ starts_at: e.value?.toISOString() || null })}
            showTime
            hourFormat="24"
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-1">
            Expires At
          </label>
          <Calendar
            id="expiresAt"
            value={formData.expires_at ? new Date(formData.expires_at) : null}
            onChange={(e) => onChange({ expires_at: e.value?.toISOString() || null })}
            showTime
            hourFormat="24"
            className="w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <InputSwitch
          id="active"
          checked={formData.active || false}
          onChange={(e) => onChange({ active: e.value })}
        />
        <label htmlFor="active" className="text-sm font-medium text-gray-700">
          Active
        </label>
      </div>
    </div>
  );
}
