import LabPartner from '../models/LabPartner.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get all lab partners entries
// @route   GET /api/lab-partners
// @access  Private/Admin
export const getAllLabPartners = async (req, res) => {
  try {
    const labPartners = await LabPartner.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: labPartners.length,
      data: labPartners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single lab partner entry
// @route   GET /api/lab-partners/:id
// @access  Private/Admin
export const getLabPartnerById = async (req, res) => {
  try {
    const labPartner = await LabPartner.findById(req.params.id);

    if (!labPartner) {
      return res.status(404).json({
        success: false,
        message: 'Lab partner entry not found'
      });
    }

    res.status(200).json({
      success: true,
      data: labPartner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new lab partner entry
// @route   POST /api/lab-partners
// @access  Private/Admin
export const createLabPartner = async (req, res) => {
  try {
    const labPartner = await LabPartner.create({
      ...req.body,
      createdBy: req.user?.name || 'Admin'
    });

    res.status(201).json({
      success: true,
      message: 'Lab partner entry created successfully',
      data: labPartner
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update lab partner entry
// @route   PUT /api/lab-partners/:id
// @access  Private/Admin
export const updateLabPartner = async (req, res) => {
  try {
    const labPartner = await LabPartner.findById(req.params.id);

    if (!labPartner) {
      return res.status(404).json({
        success: false,
        message: 'Lab partner entry not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      labPartner[key] = req.body[key];
    });

    await labPartner.save();

    res.status(200).json({
      success: true,
      message: 'Lab partner entry updated successfully',
      data: labPartner
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete lab partner entry
// @route   DELETE /api/lab-partners/:id
// @access  Private/Admin
export const deleteLabPartner = async (req, res) => {
  try {
    const labPartner = await LabPartner.findById(req.params.id);

    if (!labPartner) {
      return res.status(404).json({
        success: false,
        message: 'Lab partner entry not found'
      });
    }

    await labPartner.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Lab partner entry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload result for lab partner entry
// @route   POST /api/lab-partners/:id/upload-result
// @access  Private/Admin
export const uploadResult = async (req, res) => {
  try {
    const labPartner = await LabPartner.findById(req.params.id);

    if (!labPartner) {
      return res.status(404).json({
        success: false,
        message: 'Lab partner entry not found'
      });
    }

    // Check if file was uploaded
    if (!req.files || !req.files.result) {
      return res.status(400).json({
        success: false,
        message: 'No result file uploaded'
      });
    }

    const resultFile = req.files.result;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(resultFile.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPG, PNG, GIF, and PDF are allowed'
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(resultFile.tempFilePath, {
      folder: 'lab-results',
      resource_type: 'auto'
    });

    // Update lab partner entry
    labPartner.resultUrl = result.secure_url;
    labPartner.resultReceived = true;
    labPartner.actualResultDate = new Date();
    labPartner.status = 'Completed';

    await labPartner.save();

    res.status(200).json({
      success: true,
      message: 'Result uploaded successfully',
      data: labPartner
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload result'
    });
  }
};

// @desc    Update status of lab partner entry
// @route   PUT /api/lab-partners/:id/status
// @access  Private/Admin
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const labPartner = await LabPartner.findById(req.params.id);

    if (!labPartner) {
      return res.status(404).json({
        success: false,
        message: 'Lab partner entry not found'
      });
    }

    labPartner.status = status;
    
    // If status is completed, set result received date
    if (status === 'Completed' && !labPartner.actualResultDate) {
      labPartner.actualResultDate = new Date();
      labPartner.resultReceived = true;
    }

    await labPartner.save();

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: labPartner
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
