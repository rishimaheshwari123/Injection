import Team from '../models/Team.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get active team members
// @route   GET /api/team
// @access  Public
export const getAllTeam = async (req, res) => {
  try {
    const team = await Team.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all team members (admin)
// @route   GET /api/team/admin
// @access  Private/Admin
export const getAllTeamAdmin = async (req, res) => {
  try {
    const team = await Team.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({
      success: true,
      data: team
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get team member by id
// @route   GET /api/team/:id
// @access  Private/Admin
export const getTeamMemberById = async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }
    res.status(200).json({
      success: true,
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create team member
// @route   POST /api/team
// @access  Private/Admin
export const createTeamMember = async (req, res) => {
  try {
    const { name, role, qualification, experience, order, isActive } = req.body;

    if (!name || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name and role are required'
      });
    }

    let imageUrl = '';
    let imagePublicId = '';

    // Check if file is uploaded
    if (req.files && req.files.image) {
      const file = req.files.image;
      if (!file.mimetype.startsWith('image')) {
        return res.status(400).json({
          success: false,
          message: 'Please upload an image file'
        });
      }

      // Upload to cloudinary
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'team',
        resource_type: 'image',
        transformation: [
          { quality: 'auto:good', fetch_format: 'auto' }
        ]
      });
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    } else if (req.body.image) {
      // Fallback to text URL if provided
      imageUrl = req.body.image;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image or provide an image URL'
      });
    }

    const member = await Team.create({
      name,
      role,
      qualification,
      experience,
      image: imageUrl,
      imagePublicId,
      order: order ? parseInt(order) : 0,
      isActive: isActive === 'true' || isActive === true
    });

    res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update team member
// @route   PUT /api/team/:id
// @access  Private/Admin
export const updateTeamMember = async (req, res) => {
  try {
    const { name, role, qualification, experience, order, isActive } = req.body;

    const member = await Team.findById(req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    // Prepare update data
    const updateData = {
      name: name || member.name,
      role: role || member.role,
      qualification: qualification !== undefined ? qualification : member.qualification,
      experience: experience !== undefined ? experience : member.experience,
      order: order !== undefined ? parseInt(order) : member.order,
      isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : member.isActive
    };

    // Check if new file is uploaded
    if (req.files && req.files.image) {
      const file = req.files.image;
      if (!file.mimetype.startsWith('image')) {
        return res.status(400).json({
          success: false,
          message: 'Please upload an image file'
        });
      }

      // Delete old image from Cloudinary if it exists
      if (member.imagePublicId) {
        await cloudinary.uploader.destroy(member.imagePublicId);
      }

      // Upload new image
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: 'team',
        resource_type: 'image',
        transformation: [
          { quality: 'auto:good', fetch_format: 'auto' }
        ]
      });
      updateData.image = result.secure_url;
      updateData.imagePublicId = result.public_id;
    } else if (req.body.image) {
      updateData.image = req.body.image;
    }

    const updatedMember = await Team.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.status(200).json({
      success: true,
      message: 'Team member updated successfully',
      data: updatedMember
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete team member
// @route   DELETE /api/team/:id
// @access  Private/Admin
export const deleteTeamMember = async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    // Delete image from Cloudinary if it exists
    if (member.imagePublicId) {
      await cloudinary.uploader.destroy(member.imagePublicId);
    }

    await Team.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
