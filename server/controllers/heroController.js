import Hero from '../models/Hero.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get hero
// @route   GET /api/hero
// @access  Public
export const getHero = async (req, res) => {
  try {
    let hero = await Hero.findOne({ isActive: true });
    
    if (!hero) {
      hero = await Hero.create({ images: [], isActive: true });
    }
    
    res.status(200).json({
      success: true,
      data: hero
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload image to hero
// @route   POST /api/hero/upload
// @access  Private/Admin
export const uploadHeroImage = async (req, res) => {
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

    // Get current hero
    let hero = await Hero.findOne({ isActive: true });
    if (!hero) {
      hero = await Hero.create({ images: [], isActive: true });
    }

    // Upload to cloudinary with compression
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'hero',
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' }
      ]
    });

    // Add image to hero
    hero.images.push({
      url: result.secure_url,
      publicId: result.public_id,
      uploadedAt: new Date()
    });

    await hero.save();

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: hero
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete image from hero
// @route   DELETE /api/hero/:publicId
// @access  Private/Admin
export const deleteHeroImage = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { publicId } = req.params;
    const decodedPublicId = decodeURIComponent(publicId);

    // Find hero
    let hero = await Hero.findOne({ isActive: true });
    if (!hero) {
      return res.status(404).json({
        success: false,
        message: 'Hero not found'
      });
    }

    // Find image index
    const imageIndex = hero.images.findIndex(img => img.publicId === decodedPublicId);
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(decodedPublicId);

    // Remove from hero
    hero.images.splice(imageIndex, 1);
    await hero.save();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: hero
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
