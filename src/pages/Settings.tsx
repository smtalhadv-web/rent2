import { useState } from 'react';
import { Save, Building2, FileText, MessageCircle, Percent } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';

export function Settings() {
  const { settings, updateSettings, user } = useApp();
  const [formData, setFormData] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">You don't have permission to access settings</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 mt-1">Manage plaza profile and templates</p>
          </div>
          {saved && (
            <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg">
              Settings saved successfully!
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Plaza Profile */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Building2 className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Plaza Profile</h2>
                <p className="text-sm text-gray-500">Basic information about your plaza</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plaza Name
                </label>
                <input
                  type="text"
                  value={formData.plazaName}
                  onChange={(e) => setFormData({ ...formData, plazaName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Document Templates */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Document Templates</h2>
                <p className="text-sm text-gray-500">Customize invoice and receipt templates</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Header Text
                </label>
                <input
                  type="text"
                  value={formData.headerText}
                  onChange={(e) => setFormData({ ...formData, headerText: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Footer Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.footerText}
                  onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Terms & Conditions
                </label>
                <textarea
                  rows={4}
                  value={formData.termsConditions}
                  onChange={(e) => setFormData({ ...formData, termsConditions: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* WhatsApp Template */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">WhatsApp Template</h2>
                <p className="text-sm text-gray-500">Customize reminder message template</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Template
              </label>
              <textarea
                rows={4}
                value={formData.whatsappTemplate}
                onChange={(e) => setFormData({ ...formData, whatsappTemplate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-sm text-gray-500 mt-2">
                Available variables: {'{{tenant}}'}, {'{{month}}'}, {'{{balance}}'}
              </p>
            </div>
          </div>

          {/* Rent Increment Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Percent className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Rent Increment Settings</h2>
                <p className="text-sm text-gray-500">Configure automatic rent increase</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Annual Increment (%)
                </label>
                <input
                  type="number"
                  value={formData.defaultIncrementPercent}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultIncrementPercent: Number(e.target.value) })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autoApplyIncrement}
                    onChange={(e) =>
                      setFormData({ ...formData, autoApplyIncrement: e.target.checked })
                    }
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">
                    Automatically apply rent increment
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
            <h3 className="font-semibold mb-4">Invoice Preview</h3>
            <div className="bg-white rounded-lg p-6 text-gray-900">
              <div className="text-center border-b border-gray-200 pb-4 mb-4">
                <h2 className="text-xl font-bold">{formData.plazaName}</h2>
                <p className="text-sm text-gray-500">{formData.address}</p>
                <p className="text-sm text-gray-500">Phone: {formData.phone}</p>
                <p className="text-lg font-semibold mt-2 text-indigo-600">{formData.headerText}</p>
              </div>
              <div className="text-center text-sm text-gray-500">
                <p>{formData.footerText}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Save className="w-5 h-5" />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
