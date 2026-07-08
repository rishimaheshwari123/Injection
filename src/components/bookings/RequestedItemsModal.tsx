import { useState, useEffect } from 'react';
import { X, Loader2, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { toast } from 'react-toastify';

interface RequestedItem {
  _id?: string;
  itemName: string;
  quantity: number;
  status: 'pending' | 'brought' | 'unavailable';
}

interface RequestedItemsModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (items: RequestedItem[]) => Promise<void>;
  booking: any;
}

const RequestedItemsModal = ({ show, onClose, onSubmit, booking }: RequestedItemsModalProps) => {
  const [items, setItems] = useState<RequestedItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (booking && booking.requestedItems) {
      setItems(
        booking.requestedItems.map((item: any) => ({
          _id: item._id,
          itemName: item.itemName,
          quantity: item.quantity || 1,
          status: item.status || 'pending',
        }))
      );
    } else {
      setItems([]);
    }
  }, [booking, show]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { itemName: '', quantity: 1, status: 'pending' },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof RequestedItem, value: any) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async () => {
    const emptyItems = items.filter((item) => !item.itemName.trim());
    if (emptyItems.length > 0) {
      toast.error('All requested items must have a name');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(items);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save requested items');
    } finally {
      setSubmitting(false);
    }
  };

  if (!show || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="text-violet-600" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Requested Items</h2>
              <p className="text-xs text-gray-500">Booking for {booking.patientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body / Item List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <p className="text-sm text-gray-600">
            Add items that the patient has requested the vendor to bring (e.g., medicines, disposable syringes, or IV setups).
          </p>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200"
              >
                {/* Item Name Input */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.itemName}
                    onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                    placeholder="Item Name (e.g., Normal Saline 500ml)"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 justify-between">
                  {/* Quantity Input */}
                  <div className="w-16">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      placeholder="Qty"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none bg-white font-medium"
                    />
                  </div>

                  {/* Status Dropdown */}
                  <div className="w-28">
                    <select
                      value={item.status}
                      onChange={(e) => handleItemChange(index, 'status', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none bg-white font-medium"
                    >
                      <option value="pending">Pending</option>
                      <option value="brought">Brought</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <ShoppingBag className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-sm text-gray-500">No items requested yet.</p>
              </div>
            )}
          </div>

          <button
            onClick={handleAddItem}
            className="w-full py-2 border-2 border-dashed border-violet-300 hover:border-violet-500 text-violet-600 hover:text-violet-700 font-semibold rounded-lg flex items-center justify-center gap-2 text-sm transition-colors mt-2"
          >
            <Plus size={18} /> Add Item
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 font-semibold"
          >
            {submitting && <Loader2 size={18} className="animate-spin" />}
            {submitting ? 'Saving...' : 'Save Items'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestedItemsModal;
