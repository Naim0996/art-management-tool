'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { shopAPI, CheckoutRequest } from '@/services/ShopAPIService';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { RadioButton } from 'primereact/radiobutton';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { useRef } from 'react';

type PaymentMethod = 'stripe' | 'mock';

export default function CheckoutPage() {
  const locale = useLocale();
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const checkoutData: CheckoutRequest = {
        email,
        name,
        payment_method: paymentMethod,
        shipping_address: address,
        ...(discountCode && { discount_code: discountCode }),
      };

      const response = await shopAPI.checkout(checkoutData);
      
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `Order placed successfully! Order #${response.order_number}`,
        life: 5000,
      });

      // Redirect to shop after successful checkout
      setTimeout(() => {
        router.push(`/${locale}/shop`);
      }, 2000);
    } catch (error: unknown) {
      console.error('Error during checkout:', error);
      const message = error instanceof Error ? error.message : 'An error occurred. Please try again.';
      toast.current?.show({
        severity: 'error',
        summary: 'Checkout Failed',
        detail: message,
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast ref={toast} />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href={`/${locale}/cart`} className="text-purple-600 hover:underline mb-2 inline-block">
            <i className="pi pi-arrow-left mr-2"></i>
            Back to Cart
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Checkout</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Contact Information */}
            <Card title="Contact Information" className="shadow-sm">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <InputText
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <InputText
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full"
                  />
                </div>
              </div>
            </Card>

            {/* Shipping Address */}
            <Card title="Shipping Address" className="shadow-sm">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <InputText
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    placeholder="123 Main St"
                    required
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      City <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="New York"
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      State <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      placeholder="NY"
                      required
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Zip Code <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      value={address.zip_code}
                      onChange={(e) => setAddress({ ...address, zip_code: e.target.value })}
                      placeholder="10001"
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
                      placeholder="US"
                      required
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Discount Code */}
            <Card title="Discount Code (Optional)" className="shadow-sm">
              <div>
                <InputText
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Enter discount code"
                  className="w-full"
                />
              </div>
            </Card>

            {/* Payment Method */}
            <Card title="Payment Method" className="shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <RadioButton
                    inputId="stripe"
                    name="payment"
                    value="stripe"
                    onChange={(e) => setPaymentMethod(e.value)}
                    checked={paymentMethod === 'stripe'}
                  />
                  <label htmlFor="stripe" className="ml-3 cursor-pointer flex items-center">
                    <i className="pi pi-credit-card text-xl mr-2 text-blue-600"></i>
                    <span className="text-lg">Stripe Payment</span>
                  </label>
                </div>
                <div className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <RadioButton
                    inputId="mock"
                    name="payment"
                    value="mock"
                    onChange={(e) => setPaymentMethod(e.value)}
                    checked={paymentMethod === 'mock'}
                  />
                  <label htmlFor="mock" className="ml-3 cursor-pointer flex items-center">
                    <i className="pi pi-dollar text-xl mr-2 text-green-600"></i>
                    <span className="text-lg">Mock Payment (Testing)</span>
                  </label>
                </div>
              </div>
            </Card>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Link href={`/${locale}/cart`} className="flex-1">
                <Button
                  label="Back to Cart"
                  icon="pi pi-arrow-left"
                  outlined
                  className="w-full"
                  type="button"
                />
              </Link>
              <Button
                label={loading ? 'Processing...' : 'Place Order'}
                icon="pi pi-check"
                iconPos="right"
                className="flex-1"
                type="submit"
                loading={loading}
                size="large"
              />
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
