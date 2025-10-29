'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

export default function CheckoutPage() {
  const locale = useLocale();
  const toast = useRef<Toast>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!name || !email) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill in all required fields',
        life: 3000,
      });
      return;
    }

    toast.current?.show({
      severity: 'info',
      summary: 'Info',
      detail: 'Contact information saved. You can proceed to payment.',
      life: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast ref={toast} />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href={`/${locale}/cart`} className="text-blue-600 hover:underline mb-2 inline-block">
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

            {/* Payment Links */}
            <Card title="Complete Payment" className="shadow-sm">
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">
                  Click on one of the payment options below to complete your purchase:
                </p>
                
                <div className="space-y-3">
                  {/* Etsy Payment */}
                  <a
                    href="https://www.etsy.com/shop/mrAnarchyStudioArt" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 border-2 border-orange-600 rounded-lg cursor-pointer hover:bg-orange-50 transition-colors"
                  >
                    <i className="pi pi-shopping-bag text-2xl mr-3 text-orange-600"></i>
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-gray-900">Pay with Etsy</div>
                      <div className="text-sm text-gray-600">Complete your purchase on Etsy platform</div>
                    </div>
                    <i className="pi pi-external-link text-gray-400"></i>
                  </a>

                  {/* PayPal Payment */}
                  <a
                    href="https://paypal.com/your-payment-link" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 border-2 border-blue-600 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                  >
                    <i className="pi pi-paypal text-2xl mr-3 text-blue-600"></i>
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-gray-900">Pay with PayPal</div>
                      <div className="text-sm text-gray-600">Secure payment with PayPal</div>
                    </div>
                    <i className="pi pi-external-link text-gray-400"></i>
                  </a>

                  {/* Other Payment */}
                  <a
                    href="mailto:your@email.com?subject=Payment%20Request&body=Hello,%20I%20would%20like%20to%20complete%20my%20purchase." 
                    className="flex items-center p-4 border-2 border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <i className="pi pi-envelope text-2xl mr-3 text-gray-600"></i>
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-gray-900">Contact for Payment</div>
                      <div className="text-sm text-gray-600">Send us an email to arrange payment</div>
                    </div>
                    <i className="pi pi-external-link text-gray-400"></i>
                  </a>
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
                label="Save Contact Info"
                icon="pi pi-check"
                iconPos="right"
                className="flex-1"
                type="submit"
                size="large"
              />
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
