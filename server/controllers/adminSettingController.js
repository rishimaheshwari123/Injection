import AdminSetting from '../models/AdminSetting.js';

// @desc    Get all admin settings
// @route   GET /api/admin-settings
// @access  Private/Admin
export const getAdminSettings = async (req, res) => {
  try {
    const settings = await AdminSetting.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: settings.length,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single admin setting by ID
// @route   GET /api/admin-settings/:id
// @access  Private/Admin
export const getAdminSettingById = async (req, res) => {
  try {
    const setting = await AdminSetting.findById(req.params.id);
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Admin setting not found'
      });
    }
    res.status(200).json({
      success: true,
      data: setting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create admin setting
// @route   POST /api/admin-settings
// @access  Private/Admin
export const createAdminSetting = async (req, res) => {
  try {
    const { title, logoUrl, signatureUrl, isActive } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    // If isActive is true, deactivate all other settings
    if (isActive) {
      await AdminSetting.updateMany({}, { isActive: false });
    }

    const setting = await AdminSetting.create({
      title,
      logoUrl,
      signatureUrl,
      isActive: isActive || false
    });

    res.status(201).json({
      success: true,
      message: 'Admin setting created successfully',
      data: setting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update admin setting
// @route   PUT /api/admin-settings/:id
// @access  Private/Admin
export const updateAdminSetting = async (req, res) => {
  try {
    const { title, logoUrl, signatureUrl, isActive } = req.body;
    const setting = await AdminSetting.findById(req.params.id);

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Admin setting not found'
      });
    }

    // If setting is being set to active, deactivate all other settings
    if (isActive && !setting.isActive) {
      await AdminSetting.updateMany({}, { isActive: false });
    }

    setting.title = title || setting.title;
    setting.logoUrl = logoUrl !== undefined ? logoUrl : setting.logoUrl;
    setting.signatureUrl = signatureUrl !== undefined ? signatureUrl : setting.signatureUrl;
    setting.isActive = isActive !== undefined ? isActive : setting.isActive;

    await setting.save();

    res.status(200).json({
      success: true,
      message: 'Admin setting updated successfully',
      data: setting
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete admin setting
// @route   DELETE /api/admin-settings/:id
// @access  Private/Admin
export const deleteAdminSetting = async (req, res) => {
  try {
    const setting = await AdminSetting.findById(req.params.id);

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Admin setting not found'
      });
    }

    await setting.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Admin setting deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
