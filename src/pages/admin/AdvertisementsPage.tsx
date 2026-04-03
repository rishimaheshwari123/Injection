import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

interface Advertisement {
  _id: string;
  imageUrl: string;
  imagePublicId: string;
  linkUrl: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdvertisementsPage() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    linkUrl: ''
  });

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await api.get('/advertisements/ads/admin');
      setAds(response.data.ads);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch advertisements');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingAd && !imageFile) {
      toast.error('Please select an image');
      return;
    }

    setSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('linkUrl', formData.linkUrl);
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      if (editingAd) {
        await api.put(`/advertisements/ads/${editingAd._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Advertisement updated successfully!');
      } else {
        await api.post('/advertisements/ads', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Advertisement created successfully!');
      }
      
      await fetchAds();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving ad:', error);
      toast.error(error.response?.data?.message || 'Failed to save advertisement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      linkUrl: ad.linkUrl
    });
    setImagePreview(ad.imageUrl);
    setShowModal(true);
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.put(`/advertisements/ads/${id}/toggle`);
      toast.success('Status updated successfully!');
      await fetchAds();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      setLoading(true);
      try {
        await api.delete(`/advertisements/ads/${id}`);
        toast.success('Advertisement deleted successfully!');
        await fetchAds();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete advertisement');
        setLoading(false);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAd(null);
    setImageFile(null);
    setImagePreview('');
    setFormData({
      linkUrl: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading advertisements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Advertisements Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Advertisement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map((ad) => (
          <div key={ad._id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="relative">
              <img
                src={ad.imageUrl}
                alt="Advertisement"
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${ad.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {ad.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-1">Link URL:</p>
                <a
                  href={ad.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm break-all"
                >
                  {ad.linkUrl}
                </a>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(ad)}
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(ad._id)}
                  disabled={submitting}
                  className={`flex-1 px-3 py-2 rounded text-sm ${ad.isActive ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white disabled:opacity-50`}
                >
                  {ad.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(ad._id)}
                  disabled={submitting}
                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {ads.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No advertisements found. Create your first one!
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">{editingAd ? 'Edit Advertisement' : 'Add Advertisement'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Image *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full border rounded px-3 py-2"
                    required={!editingAd}
                  />
                  {imagePreview && (
                    <div className="mt-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 rounded border mx-auto"
                      />
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Link URL *</label>
                  <input
                    type="url"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="https://example.com"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter the URL where users will be redirected when they click the ad</p>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={submitting}
                    className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {submitting ? 'Saving...' : (editingAd ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
