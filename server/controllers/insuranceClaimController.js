import InsuranceClaim from '../models/InsuranceClaim.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

// Create new insurance claim
export const createClaim = async (req, res) => {
  try {
    const {
      claimNumber,
      userId,
      patientName,
      patientAge,
      patientGender,
      contactNumber,
      email,
      insuranceProvider,
      policyNumber,
      claimType,
      claimAmount,
      treatmentDate,
      diagnosis,
      description,
      createdBy
    } = req.body;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Handle document uploads
    let documents = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'insurance_claims',
          resource_type: 'auto'
        });
        documents.push({
          name: file.originalname,
          url: result.secure_url,
          uploadedAt: new Date()
        });
      }
    }

    const claim = new InsuranceClaim({
      claimNumber,
      userId,
      patientName,
      patientAge,
      patientGender,
      contactNumber,
      email,
      insuranceProvider,
      policyNumber,
      claimType,
      claimAmount,
      treatmentDate,
      diagnosis,
      description,
      documents,
      createdBy: createdBy || 'User'
    });

    await claim.save();

    res.status(201).json({
      message: 'Insurance claim submitted successfully',
      claim
    });
  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(500).json({ message: 'Error creating claim', error: error.message });
  }
};

// Get all claims (Admin)
export const getAllClaims = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (status && status !== 'All') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { claimNumber: { $regex: search, $options: 'i' } },
        { patientName: { $regex: search, $options: 'i' } },
        { policyNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const claims = await InsuranceClaim.find(query)
      .populate('userId', 'name email phone')
      .populate('processedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await InsuranceClaim.countDocuments(query);

    res.json({
      claims,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching claims:', error);
    res.status(500).json({ message: 'Error fetching claims', error: error.message });
  }
};

// Get claims by user
export const getUserClaims = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const claims = await InsuranceClaim.find({ userId })
      .sort({ createdAt: -1 });

    res.json({ claims });
  } catch (error) {
    console.error('Error fetching user claims:', error);
    res.status(500).json({ message: 'Error fetching user claims', error: error.message });
  }
};

// Get single claim
export const getClaimById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const claim = await InsuranceClaim.findById(id)
      .populate('userId', 'name email phone')
      .populate('processedBy', 'name');

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    res.json({ claim });
  } catch (error) {
    console.error('Error fetching claim:', error);
    res.status(500).json({ message: 'Error fetching claim', error: error.message });
  }
};

// Update claim status (Admin)
export const updateClaimStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, rejectionReason, approvedAmount } = req.body;
    const adminId = req.user.id;

    const claim = await InsuranceClaim.findById(id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    claim.status = status;
    claim.adminNotes = adminNotes || claim.adminNotes;
    claim.processedBy = adminId;
    claim.processedAt = new Date();

    if (status === 'Rejected' && rejectionReason) {
      claim.rejectionReason = rejectionReason;
    }

    if (status === 'Approved' && approvedAmount) {
      claim.approvedAmount = approvedAmount;
    }

    await claim.save();

    res.json({
      message: 'Claim status updated successfully',
      claim
    });
  } catch (error) {
    console.error('Error updating claim status:', error);
    res.status(500).json({ message: 'Error updating claim status', error: error.message });
  }
};

// Update claim details
export const updateClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const claim = await InsuranceClaim.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    res.json({
      message: 'Claim updated successfully',
      claim
    });
  } catch (error) {
    console.error('Error updating claim:', error);
    res.status(500).json({ message: 'Error updating claim', error: error.message });
  }
};

// Delete claim
export const deleteClaim = async (req, res) => {
  try {
    const { id } = req.params;

    const claim = await InsuranceClaim.findByIdAndDelete(id);
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    res.json({ message: 'Claim deleted successfully' });
  } catch (error) {
    console.error('Error deleting claim:', error);
    res.status(500).json({ message: 'Error deleting claim', error: error.message });
  }
};

// Get claim statistics (Admin Dashboard)
export const getClaimStats = async (req, res) => {
  try {
    const totalClaims = await InsuranceClaim.countDocuments();
    const pendingClaims = await InsuranceClaim.countDocuments({ status: 'Pending' });
    const approvedClaims = await InsuranceClaim.countDocuments({ status: 'Approved' });
    const rejectedClaims = await InsuranceClaim.countDocuments({ status: 'Rejected' });

    const totalClaimAmount = await InsuranceClaim.aggregate([
      { $group: { _id: null, total: { $sum: '$claimAmount' } } }
    ]);

    const approvedClaimAmount = await InsuranceClaim.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: null, total: { $sum: '$approvedAmount' } } }
    ]);

    res.json({
      totalClaims,
      pendingClaims,
      approvedClaims,
      rejectedClaims,
      totalClaimAmount: totalClaimAmount[0]?.total || 0,
      approvedClaimAmount: approvedClaimAmount[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching claim stats:', error);
    res.status(500).json({ message: 'Error fetching claim stats', error: error.message });
  }
};

export default {
  createClaim,
  getAllClaims,
  getUserClaims,
  getClaimById,
  updateClaimStatus,
  updateClaim,
  deleteClaim,
  getClaimStats
};
