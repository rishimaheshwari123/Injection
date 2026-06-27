import { useState, useEffect } from 'react';
import { heroAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Trash2, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';

interface HeroImage {
  url: string;
  publicId: string;
  uploadedAt: string;
}

interface Hero {
  _id: string;
  images: HeroImage[];
  isActive: boolean;
}

export default function HeroPage() {
  const [hero, setHero] = useState<Hero | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingPublicId, setDeletingPublicId] = useState<string | null>(null);

  useEffect(() => {
    fetchHero();
  }, []);

  const fetchHero = async () => {
    try {
      const response = await heroAPI.getHero();
      setHero(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch hero');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploading(true);
    try {
      const response = await heroAPI.uploadImage(file);
      setHero(response.data.data);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleDelete = async (publicId: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      setDeletingPublicId(publicId);
      try {
        const response = await heroAPI.deleteImage(publicId);
        setHero(response.data.data);
        toast.success('Image deleted successfully!');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete image');
      } finally {
        setDeletingPublicId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#63D64F] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hero...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hero Slider Management</h1>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-xl font-semibold mb-2">Upload New Hero Image</h2>
        <p className="text-gray-600 mb-6">
          Upload images for your hero slider. Images are automatically compressed for optimal performance.
        </p>

        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-[#63D64F] hover:bg-gradient-to-r from-[#63D64F]/5 to-[#3DB9A6]/5 transition-all duration-300">
          {uploading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="w-12 h-12 text-[#63D64F] animate-spin" />
              <span className="text-lg text-gray-700 font-medium">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Upload className="w-12 h-12 text-gray-400" />
              <span className="text-lg text-gray-700 font-medium">Click to select an image</span>
              <span className="text-sm text-gray-500">or drag and drop</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {/* Hero Grid */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Hero Slider Images ({hero?.images.length || 0})
          </h2>
        </div>
        
        {hero?.images.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <ImageIcon size={80} className="mx-auto mb-6 text-gray-300" />
            <p className="text-xl">No images in hero slider</p>
            <p className="text-sm mt-2">Static images will be shown on frontend</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {hero?.images.map((image, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                <img
                  src={image.url}
                  alt={`Hero ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <button
                    onClick={() => handleDelete(image.publicId)}
                    disabled={deletingPublicId === image.publicId}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-all duration-300 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {deletingPublicId === image.publicId ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                    {deletingPublicId === image.publicId ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
