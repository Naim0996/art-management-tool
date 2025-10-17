'use client';

import { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { useRef } from 'react';

export default function SettingsPage() {
  const toast = useRef<Toast>(null);
  
  const [settings, setSettings] = useState({
    siteName: 'Art Management Tool',
    siteEmail: 'admin@artmanagement.com',
    currency: 'USD',
    taxRate: 10,
    enableNotifications: true,
    enableGuestCheckout: true,
    maintenanceMode: false,
  });

  const handleSave = () => {
    // TODO: Implement backend endpoint for settings
    toast.current?.show({
      severity: 'success',
      summary: 'Success',
      detail: 'Settings saved successfully',
      life: 3000,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <Toast ref={toast} />
      
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">Manage application settings and configuration</p>
      </div>

      {/* General Settings */}
      <Card title="General Settings" className="shadow-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Name
            </label>
            <InputText
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Email
            </label>
            <InputText
              value={settings.siteEmail}
              onChange={(e) => setSettings({ ...settings, siteEmail: e.target.value })}
              className="w-full"
              type="email"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <InputText
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Rate (%)
              </label>
              <InputText
                value={settings.taxRate.toString()}
                onChange={(e) =>
                  setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })
                }
                className="w-full"
                type="number"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Features */}
      <Card title="Features" className="shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Enable Notifications</p>
              <p className="text-sm text-gray-500">Receive email notifications for new orders</p>
            </div>
            <InputSwitch
              checked={settings.enableNotifications}
              onChange={(e) =>
                setSettings({ ...settings, enableNotifications: e.value || false })
              }
            />
          </div>

          <Divider />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Guest Checkout</p>
              <p className="text-sm text-gray-500">Allow customers to checkout without registration</p>
            </div>
            <InputSwitch
              checked={settings.enableGuestCheckout}
              onChange={(e) =>
                setSettings({ ...settings, enableGuestCheckout: e.value || false })
              }
            />
          </div>

          <Divider />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Maintenance Mode</p>
              <p className="text-sm text-gray-500">Temporarily disable site access for maintenance</p>
            </div>
            <InputSwitch
              checked={settings.maintenanceMode}
              onChange={(e) =>
                setSettings({ ...settings, maintenanceMode: e.value || false })
              }
            />
          </div>
        </div>
      </Card>

      {/* System Info */}
      <Card title="System Information" className="shadow-lg">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Application Version</span>
            <span className="font-semibold">1.0.0</span>
          </div>
          <Divider />
          <div className="flex justify-between">
            <span className="text-gray-600">Database Status</span>
            <span className="font-semibold text-green-600">Connected</span>
          </div>
          <Divider />
          <div className="flex justify-between">
            <span className="text-gray-600">Backend Status</span>
            <span className="font-semibold text-green-600">Running</span>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          label="Cancel"
          icon="pi pi-times"
          severity="secondary"
          outlined
        />
        <Button
          label="Save Settings"
          icon="pi pi-check"
          onClick={handleSave}
        />
      </div>
    </div>
  );
}
