import React, { useState, useEffect } from 'react';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { useAuth } from '../../hooks/useAuth';
import { updateDocument, insertDocument } from '../../firebase/firestore';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const { user } = useAuth();
  const { data: settingsList = [] } = useFirestoreQuery('settings');
  const currentSettings = settingsList[0] || {};

  const [formData, setFormData] = useState({
    pharmacyName: '',
    tagline: '',
    address: '',
    phone: '',
    email: '',
    currency: 'NGN',
    currencySymbol: '₦',
    expiryAlertDays: 60,
    receiptFooter: '',
    nafdacLicense: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentSettings && Object.keys(currentSettings).length > 0) {
      setFormData({
        pharmacyName: currentSettings.pharmacyName || 'PharmaSense Community Pharmacy',
        tagline: currentSettings.tagline || 'Healthcare Excellence & Smart Dispensing',
        address: currentSettings.address || '14 Adeleke Street, Victoria Island, Lagos, Nigeria',
        phone: currentSettings.phone || '+234 800 PHARMASENSE',
        email: currentSettings.email || 'care@pharmasense.ng',
        currency: currentSettings.currency || 'NGN',
        currencySymbol: currentSettings.currencySymbol || '₦',
        expiryAlertDays: currentSettings.expiryAlertDays || 60,
        receiptFooter: currentSettings.receiptFooter || 'Thank you for your patronage! Take your medicines as prescribed.',
        nafdacLicense: currentSettings.nafdacLicense || 'PCN-REG-2026-8841',
      });
    }
  }, [JSON.stringify(currentSettings)]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (currentSettings.id) {
        await updateDocument('settings', currentSettings.id, formData, user?.uid);
      } else {
        await insertDocument('settings', formData, 'general', user?.uid);
      }
      toast.success('Pharmacy settings saved successfully');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Pharmacy Configuration & Settings"
        subtitle="Manage pharmacy brand identity, receipt templates, and regulatory credentials"
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization Profile */}
        <Card
          title="Pharmacy Entity & Licensing"
          subtitle="Legal name and NAFDAC registration details for receipts"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Pharmacy Official Trade Name"
                value={formData.pharmacyName}
                onChange={(e) => handleChange('pharmacyName', e.target.value)}
                placeholder="e.g. PharmaSense Pharmacy"
                required
              />
              <Input
                label="Tagline / Mission"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                placeholder="e.g. Caring For Your Health"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="PCN / NAFDAC Premises License"
                value={formData.nafdacLicense}
                onChange={(e) => handleChange('nafdacLicense', e.target.value)}
                placeholder="e.g. PCN-REG-2026-8841"
              />
              <Input
                label="Official Phone Number"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="e.g. +234 800 742 762"
              />
              <Input
                label="Official Support Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="e.g. info@pharmacy.ng"
              />
            </div>

            <Textarea
              label="Physical Dispensary Address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              rows={2}
              placeholder="e.g. 14 Adeleke Street, Victoria Island, Lagos"
            />
          </div>
        </Card>

        {/* Operating & Alert Parameters */}
        <Card
          title="Operational & Receipt Defaults"
          subtitle="Set warning timeframes and receipt printing parameters"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Default Near-Expiry Alert Window"
                value={formData.expiryAlertDays}
                onChange={(e) => handleChange('expiryAlertDays', Number(e.target.value))}
              >
                <option value={30}>30 Days (High Urgency)</option>
                <option value={60}>60 Days (Standard Recommended)</option>
                <option value={90}>90 Days (Quarterly Horizon)</option>
                <option value={180}>180 Days (Half-Year Horizon)</option>
              </Select>

              <Input
                label="Currency Symbol"
                value={formData.currencySymbol}
                onChange={(e) => handleChange('currencySymbol', e.target.value)}
                placeholder="e.g. ₦"
              />
            </div>

            <Textarea
              label="Thermal Receipt Footer Text"
              value={formData.receiptFooter}
              onChange={(e) => handleChange('receiptFooter', e.target.value)}
              rows={2}
              placeholder="e.g. Thank you for your patronage! Take your medicines as prescribed."
            />
          </div>
        </Card>

        {/* Save Actions */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSaving}
            icon={Save}
            className="font-bold shadow-md shadow-primary/20"
          >
            Save Pharmacy Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
