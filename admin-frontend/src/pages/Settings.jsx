import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Settings as SettingsIcon, Truck, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const [deliveryFee, setDeliveryFee] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      setDeliveryFee(res.data.data.deliveryFee);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/admin/settings', { deliveryFee: Number(deliveryFee) });
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gradient flex items-center gap-2">
          <SettingsIcon className="w-8 h-8" />
          Store Settings
        </h1>
        <p className="text-gray-600 mt-1">Manage your store configuration</p>
      </div>

      <div className="max-w-lg">
        <form onSubmit={handleSubmit} className="card p-6 space-y-6">
          {/* Delivery Fee */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary-600" />
              Delivery Settings
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Fee (ETB)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  ETB
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className="input-field pl-14"
                  placeholder="150"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                This fee is charged to customers who choose home delivery. Pickup orders have no delivery fee.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Settings
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
