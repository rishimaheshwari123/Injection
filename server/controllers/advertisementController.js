import Advertisement from '../models/Advertisement.js';
import { v2 as cloudinary } from 'cloudinary';

// Get all advertisements (public)
export const getAllAds = async (req, res) => {
  try {
    const ads = await Advertisement.find({ isActive: true }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      ads
    });
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch advertisements',
      error: error.message
    });
  }
};

// Get all advertisements (admin - including inactive)
export const getAllAdsAdmin = async (req, res) => {
  try {
    const ads = await Advertisement.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      ads
    });
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch advertisements',
      error: error.message
    });
  }
};

// Create advertisement (admin)
export const createAd = async (req, res) => {
  try {
    const { linkUrl } = req.body;

    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
      folder: 'advertisements',
      resource_type: 'auto'
    });

    const ad = await Advertisement.create({
      imageUrl: result.secure_url,
      imagePublicId: result.public_id,
      linkUrl
    });

    res.status(201).json({
      success: true,
      message: 'Advertisement created successfully',
      ad
    });
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create advertisement',
      error: error.message
    });
  }
};

// Update advertisement (admin)
export const updateAd = async (req, res) => {
  try {
    const { linkUrl, isActive } = req.body;
    const ad = await Advertisement.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }

    // Update link URL if provided
    if (linkUrl) {
      ad.linkUrl = linkUrl;
    }

    // Update active status if provided
    if (typeof isActive !== 'undefined') {
      ad.isActive = isActive;
    }

    // Update image if new one is provided
    if (req.files && req.files.image) {
      // Delete old image from Cloudinary
      await cloudinary.uploader.destroy(ad.imagePublicId);

      // Upload new image
      const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: 'advertisements',
        resource_type: 'auto'
      });

      ad.imageUrl = result.secure_url;
      ad.imagePublicId = result.public_id;
    }

    await ad.save();

    res.status(200).json({
      success: true,
      message: 'Advertisement updated successfully',
      ad
    });
  } catch (error) {
    console.error('Error updating ad:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update advertisement',
      error: error.message
    });
  }
};

// Delete advertisement (admin)
export const deleteAd = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }

    // Delete image from Cloudinary
    await cloudinary.uploader.destroy(ad.imagePublicId);

    // Delete from database
    await Advertisement.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Advertisement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ad:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete advertisement',
      error: error.message
    });
  }
};

// Toggle active status (admin)
export const toggleAdStatus = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }

    ad.isActive = !ad.isActive;
    await ad.save();

    res.status(200).json({
      success: true,
      message: `Advertisement ${ad.isActive ? 'activated' : 'deactivated'} successfully`,
      ad
    });
  } catch (error) {
    console.error('Error toggling ad status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle advertisement status',
      error: error.message
    });
  }
};
