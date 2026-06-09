import { useEffect, useState } from 'react';
import { Settings, Upload, Trash2, Edit2, Plus, Loader2, Image, FileText, CheckCircle2, X } from 'lucide-react';
import { adminSettingAPI, prescriptionAPI } from '../../services/api';
import { toast } from 'react-toastify';

interface SettingItem {
  _id: string;
  title: string;
  logoUrl: string | null;
  signatureUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

const SettingsPage = () => {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<SettingItem | null>(null);
  const [title, setTitle] = useState('');
  const [isActive, setIsActive] = useState(false);

  // Logo file upload state
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [logoUploading, setLogoUploading] = useState(false);

  // Signature file upload state
  const [signaturePreview, setSignaturePreview] = useState<string>('');
  const [signatureUrl, setSignatureUrl] = useState<string>('');
  const [signatureUploading, setSignatureUploading] = useState(false);

  useEffect(() => {
    fetchSettings(true);
  }, []);

  const fetchSettings = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const response = await adminSettingAPI.getAllSettings();
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error: any) {
      toast.error('Failed to fetch admin settings');
      console.error(error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setTitle('');
    setIsActive(false);
    setLogoPreview('');
    setLogoUrl('');
    setSignaturePreview('');
    setSignatureUrl('');
    setShowModal(true);
  };

  const handleOpenEdit = (item: SettingItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setIsActive(item.isActive);
    setLogoPreview(item.logoUrl || '');
    setLogoUrl(item.logoUrl || '');
    setSignaturePreview(item.signatureUrl || '');
    setSignatureUrl(item.signatureUrl || '');
    setShowModal(true);
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size (5MB max)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload an image (JPG, PNG, GIF)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setLogoPreview(URL.createObjectURL(file));

    // Upload immediately to Cloudinary to get the URL
    setLogoUploading(true);
    try {
      const res = await prescriptionAPI.uploadImage(file);
      if (res.data.success) {
        setLogoUrl(res.data.data.url);
        toast.success('Logo uploaded successfully!');
      } else {
        toast.error('Logo upload failed: ' + res.data.message);
      }
    } catch (err: any) {
      toast.error('Logo upload error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSignatureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload an image (JPG, PNG, GIF)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setSignaturePreview(URL.createObjectURL(file));

    // Upload immediately to Cloudinary
    setSignatureUploading(true);
    try {
      const res = await prescriptionAPI.uploadImage(file);
      if (res.data.success) {
        setSignatureUrl(res.data.data.url);
        toast.success('Signature uploaded successfully!');
      } else {
        toast.error('Signature upload failed: ' + res.data.message);
      }
    } catch (err: any) {
      toast.error('Signature upload error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSignatureUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (logoUploading || signatureUploading) {
      toast.warning('Please wait for images to finish uploading');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        logoUrl: logoUrl || null,
        signatureUrl: signatureUrl || null,
        isActive
      };

      if (editingItem) {
        // Edit Mode
        const res = await adminSettingAPI.updateSetting(editingItem._id, payload);
        if (res.data.success) {
          const updatedSetting = res.data.data;
          toast.success('Configuration updated successfully!');
          setShowModal(false);
          
          setSettings((prev) => {
            let updated = prev.map((item) =>
              item._id === updatedSetting._id ? updatedSetting : item
            );
            if (updatedSetting.isActive) {
              updated = updated.map((item) =>
                item._id === updatedSetting._id ? item : { ...item, isActive: false }
              );
            }
            return updated;
          });
          
          fetchSettings(false);
        }
      } else {
        // Add Mode
        const res = await adminSettingAPI.createSetting(payload);
        if (res.data.success) {
          const newSetting = res.data.data;
          toast.success('Configuration added successfully!');
          setShowModal(false);
          
          setSettings((prev) => {
            let updated = [newSetting, ...prev];
            if (newSetting.isActive) {
              updated = updated.map((item) =>
                item._id === newSetting._id ? item : { ...item, isActive: false }
              );
            }
            return updated;
          });
          
          fetchSettings(false);
        }
      }
    } catch (error: any) {
      toast.error('Failed to save settings: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this setting configuration?')) return;

    try {
      const res = await adminSettingAPI.deleteSetting(id);
      if (res.data.success) {
        toast.success('Configuration deleted successfully');
        setSettings((prev) => prev.filter((item) => item._id !== id));
        fetchSettings(false);
      }
    } catch (error: any) {
      toast.error('Failed to delete configuration: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleToggleActive = async (item: SettingItem) => {
    if (item.isActive) return; // Already active

    try {
      const res = await adminSettingAPI.updateSetting(item._id, { isActive: true });
      if (res.data.success) {
        const updatedSetting = res.data.data;
        toast.success(`"${item.title}" is now set as the active layout!`);
        setSettings((prev) =>
          prev.map((s) =>
            s._id === updatedSetting._id
              ? updatedSetting
              : { ...s, isActive: false }
          )
        );
        fetchSettings(false);
      }
    } catch (error: any) {
      toast.error('Failed to activate configuration');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Settings className="text-[#63D64F]" />
            Settings Management
          </h1>
          <p className="text-gray-500 mt-1">Configure global branding resources like logo & doctor signature</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all font-semibold"
        >
          <Plus size={20} />
          Add Configuration
        </button>
      </div>

      {/* Grid of configurations */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#63D64F]"></div>
        </div>
      ) : settings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-100">
          <Image className="mx-auto text-gray-300 mb-4 animate-pulse" size={56} />
          <h3 className="text-lg font-bold text-gray-700">No settings configuration available</h3>
          <p className="text-gray-500 mt-1 mb-6">Create a configuration to upload your primary logo and doctor's signature</p>
          <button
            onClick={handleOpenAdd}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            Create Setup
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settings.map((item) => (
            <div
              key={item._id}
              className={`bg-white rounded-xl overflow-hidden shadow-md border-2 transition-all hover:shadow-xl flex flex-col justify-between ${
                item.isActive ? 'border-[#63D64F]' : 'border-gray-200'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Created: {new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                {item.isActive ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold shadow-sm">
                    <CheckCircle2 size={14} />
                    Active
                  </span>
                ) : (
                  <button
                    onClick={() => handleToggleActive(item)}
                    className="text-xs font-semibold px-2.5 py-1 text-gray-600 hover:text-[#63D64F] hover:bg-green-50 border border-gray-300 hover:border-[#63D64F] rounded-full transition-all"
                  >
                    Set Active
                  </button>
                )}
              </div>

              {/* Card Body (Previews) */}
              <div className="p-6 space-y-6 flex-1">
                {/* Logo Preview */}
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Platform Logo</span>
                  {item.logoUrl ? (
                    <div className="h-20 bg-gray-50 rounded-lg flex items-center justify-center p-3 border border-gray-100 relative group overflow-hidden">
                      <img
                        src={item.logoUrl}
                        alt="Logo Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                      <button
                        onClick={() => window.open(item.logoUrl || '', '_blank')}
                        className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium"
                      >
                        View Full Size
                      </button>
                    </div>
                  ) : (
                    <div className="h-20 bg-gray-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-200 text-gray-400">
                      <Image size={24} className="mb-1" />
                      <span className="text-xs font-medium">No Logo Uploaded</span>
                    </div>
                  )}
                </div>

                {/* Signature Preview */}
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Doctor Signature</span>
                  {item.signatureUrl ? (
                    <div className="h-20 bg-gray-50 rounded-lg flex items-center justify-center p-3 border border-gray-100 relative group overflow-hidden">
                      <img
                        src={item.signatureUrl}
                        alt="Signature Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                      <button
                        onClick={() => window.open(item.signatureUrl || '', '_blank')}
                        className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium"
                      >
                        View Full Size
                      </button>
                    </div>
                  ) : (
                    <div className="h-20 bg-gray-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-200 text-gray-400">
                      <FileText size={24} className="mb-1" />
                      <span className="text-xs font-medium">No Signature Uploaded</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-2 bg-white text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg border border-gray-200 hover:border-blue-600 transition-all shadow-sm"
                  title="Edit Settings"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  disabled={item.isActive}
                  className="p-2 bg-white text-red-600 hover:text-white hover:bg-red-600 rounded-lg border border-gray-200 hover:border-red-600 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-red-600 disabled:hover:border-gray-200"
                  title={item.isActive ? "Cannot delete active configuration" : "Delete Settings"}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
              <h2 className="text-xl font-bold text-gray-800">
                {editingItem ? 'Edit Configuration' : 'Add Setting Configuration'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* Config Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Configuration Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Primary Branding, Winter Promo Logo"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none text-sm"
                  required
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Branding Logo
                </label>
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="col-span-2 relative border-2 border-dashed border-gray-300 hover:border-[#63D64F] rounded-lg p-4 transition-all bg-gray-50 flex flex-col items-center justify-center text-center cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {logoUploading ? (
                      <div className="flex flex-col items-center justify-center py-2">
                        <Loader2 className="animate-spin text-[#63D64F]" size={28} />
                        <span className="text-xs text-gray-500 mt-2 font-medium">Uploading logo to cloud...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="text-gray-400 mb-2" size={24} />
                        <span className="text-xs font-semibold text-gray-700">Choose Image or Drag & Drop</span>
                        <span className="text-[10px] text-gray-500 mt-1">PNG, JPG, GIF (Max 5MB)</span>
                      </>
                    )}
                  </div>
                  {/* Logo Preview box */}
                  <div className="h-24 border border-gray-200 rounded-lg flex items-center justify-center bg-white p-2 relative overflow-hidden shadow-sm">
                    {logoPreview ? (
                      <>
                        <img src={logoPreview} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                        <button
                          type="button"
                          onClick={() => {
                            setLogoPreview('');
                            setLogoUrl('');
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
                        >
                          <X size={10} />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">No Logo</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Signature Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Doctor Signature Image
                </label>
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="col-span-2 relative border-2 border-dashed border-gray-300 hover:border-[#63D64F] rounded-lg p-4 transition-all bg-gray-50 flex flex-col items-center justify-center text-center cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {signatureUploading ? (
                      <div className="flex flex-col items-center justify-center py-2">
                        <Loader2 className="animate-spin text-[#63D64F]" size={28} />
                        <span className="text-xs text-gray-500 mt-2 font-medium">Uploading signature to cloud...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="text-gray-400 mb-2" size={24} />
                        <span className="text-xs font-semibold text-gray-700">Choose Image or Drag & Drop</span>
                        <span className="text-[10px] text-gray-500 mt-1">PNG, JPG, GIF (Max 5MB)</span>
                      </>
                    )}
                  </div>
                  {/* Signature Preview box */}
                  <div className="h-24 border border-gray-200 rounded-lg flex items-center justify-center bg-white p-2 relative overflow-hidden shadow-sm">
                    {signaturePreview ? (
                      <>
                        <img src={signaturePreview} alt="Signature preview" className="max-h-full max-w-full object-contain" />
                        <button
                          type="button"
                          onClick={() => {
                            setSignaturePreview('');
                            setSignatureUrl('');
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
                        >
                          <X size={10} />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">No Signature</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Toggle Switch */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-5">
                <div>
                  <span className="text-sm font-bold text-gray-800 block">Set as Active Configuration</span>
                  <span className="text-xs text-gray-500 mt-0.5">Use this logo and signature across the application</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#63D64F]"></div>
                </label>
              </div>

              {/* Form Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-semibold"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all text-sm font-bold flex items-center gap-2"
                  disabled={saving || logoUploading || signatureUploading}
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
