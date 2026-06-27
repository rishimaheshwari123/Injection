import Gallery from '../models/Gallery.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get gallery
// @route   GET /api/gallery
// @access  Public
export const getGallery = async (req, res) => {
  try {
    let gallery = await Gallery.findOne({ isActive: true });

    if (!gallery) {
      gallery = await Gallery.create({ images: [], isActive: true });
    }

    res.status(200).json({
      success: true,
      data: gallery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload image to gallery
// @route   POST /api/gallery/upload
// @access  Private/Admin
export const uploadGalleryImage = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const file = req.files.image;

    if (!file.mimetype.startsWith('image')) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Get current gallery
    let gallery = await Gallery.findOne({ isActive: true });
    if (!gallery) {
      gallery = await Gallery.create({ images: [], isActive: true });
    }



    // Upload to cloudinary with compression
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'gallery',
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' }
      ]
    });

    // Add image to gallery
    gallery.images.push({
      url: result.secure_url,
      publicId: result.public_id,
      uploadedAt: new Date()
    });

    await gallery.save();

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: gallery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete image from gallery
// @route   DELETE /api/gallery/:publicId
// @access  Private/Admin
export const deleteGalleryImage = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { publicId } = req.params;
    const decodedPublicId = decodeURIComponent(publicId);

    // Find gallery
    let gallery = await Gallery.findOne({ isActive: true });
    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery not found'
      });
    }

    // Find image index
    const imageIndex = gallery.images.findIndex(img => img.publicId === decodedPublicId);
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(decodedPublicId);

    // Remove from gallery
    gallery.images.splice(imageIndex, 1);
    await gallery.save();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: gallery
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
