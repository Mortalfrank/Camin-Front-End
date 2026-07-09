import { useState, useEffect } from 'react';
import {
  ShippingAddress,
  getShippingAddresses,
  addShippingAddress,
  updateShippingAddress,
  deleteShippingAddress,
} from '../api/client';

const emptyForm = { recipientName: '', phoneNumber: '', address: '', isDefault: false };

export default function ShippingAddressManager() {
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setAddresses(await getShippingAddresses());
    } catch {}
  };

  const handleEdit = (addr: ShippingAddress) => {
    setEditingId(addr.id);
    setForm({ recipientName: addr.recipientName, phoneNumber: addr.phoneNumber, address: addr.address, isDefault: addr.isDefault });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this address?')) return;
    await deleteShippingAddress(id);
    load();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateShippingAddress(editingId, form);
      } else {
        await addShippingAddress(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setMessage('Address saved!');
      setTimeout(() => setMessage(null), 2000);
      load();
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Shipping Addresses</h3>
        {!showForm && (
          <button
            type="button"
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
            className="text-sm px-3 py-1 border border-black rounded hover:bg-gray-100"
          >
            + Add Address
          </button>
        )}
      </div>

      {message && <p className="text-sm text-green-600 mb-2">{message}</p>}

      {addresses.length === 0 && !showForm && (
        <p className="text-sm text-gray-500">No saved addresses yet.</p>
      )}

      <div className="space-y-3 mb-4">
        {addresses.map((addr) => (
          <div key={addr.id} className="border rounded p-3 text-sm">
            <div className="flex justify-between items-start">
              <div>
                {addr.isDefault && <span className="text-xs bg-black text-white px-2 py-0.5 rounded mr-2">Default</span>}
                <span className="font-medium">{addr.recipientName}</span>
                <span className="text-gray-500 ml-2">{addr.phoneNumber}</span>
                <p className="text-gray-700 mt-1">{addr.address}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button type="button" onClick={() => handleEdit(addr)} className="text-blue-600 hover:underline">Edit</button>
                <button type="button" onClick={() => handleDelete(addr.id)} className="text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded p-4 space-y-3">
          <h4 className="font-medium">{editingId ? 'Edit Address' : 'New Address'}</h4>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Recipient Name"
            value={form.recipientName}
            onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
            required
          />
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Phone Number"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            required
          />
          <textarea
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Street, city, state, postal code"
            rows={2}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
            />
            Set as default address
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="px-4 py-2 border border-black rounded text-sm hover:bg-gray-100 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
              className="px-4 py-2 text-sm text-gray-500 hover:underline">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
