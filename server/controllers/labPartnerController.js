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
    // Destructure and validate fields from request body
    const {
      // Lab Information
      labName,
      labAddress,
      labContact,
      labEmail,
      
      // Patient Information
      patientName,
      patientAge,
      patientGender,
      patientContact,
      
      // Sample/Test Information
      testType,
      sampleType,
      sampleCollectionDate,
      sampleSentDate,
      
      // Status and Results
      status,
      expectedResultDate,
      actualResultDate,
      resultReceived,
      resultUrl,
      
      // Additional Information
      remarks,
      urgency,
      cost
    } = req.body;

    // Validate required fields
    if (!labName || !labAddress || !labContact) {
      return res.status(400).json({
        success: false,
        message: 'Lab name, address, and contact are required'
      });
    }

    if (!patientName || !patientAge || !patientGender || !patientContact) {
      return res.status(400).json({
        success: false,
        message: 'Patient name, age, gender, and contact are required'
      });
    }

    if (!testType || !sampleType || !sampleCollectionDate || !sampleSentDate) {
      return res.status(400).json({
        success: false,
        message: 'Test type, sample type, collection date, and sent date are required'
      });
    }

    // Validate patient gender
    const validGenders = ['Male', 'Female', 'Other'];
    if (!validGenders.includes(patientGender)) {
      return res.status(400).json({
        success: false,
        message: `Patient gender must be one of: ${validGenders.join(', ')}`
      });
    }

    // Validate status if provided
    const validStatuses = ['Sent to Lab', 'In Progress', 'Completed', 'Cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Validate urgency if provided
    const validUrgencies = ['Normal', 'Urgent', 'Critical'];
    if (urgency && !validUrgencies.includes(urgency)) {
      return res.status(400).json({
        success: false,
        message: `Urgency must be one of: ${validUrgencies.join(', ')}`
      });
    }

    // Validate patient age
    if (patientAge < 0 || patientAge > 150) {
      return res.status(400).json({
        success: false,
        message: 'Patient age must be between 0 and 150'
      });
    }

    // Create lab partner entry with validated data
    const labPartner = await LabPartner.create({
      // Lab Information
      labName,
      labAddress,
      labContact,
      labEmail,
      
      // Patient Information
      patientName,
      patientAge,
      patientGender,
      patientContact,
      
      // Sample/Test Information
      testType,
      sampleType,
      sampleCollectionDate: new Date(sampleCollectionDate),
      sampleSentDate: new Date(sampleSentDate),
      
      // Status and Results
      status: status || 'Sent to Lab',
      expectedResultDate: expectedResultDate ? new Date(expectedResultDate) : undefined,
      actualResultDate: actualResultDate ? new Date(actualResultDate) : undefined,
      resultReceived: resultReceived || false,
      resultUrl: resultUrl || null,
      
      // Additional Information
      remarks: remarks || '',
      urgency: urgency || 'Normal',
      cost: cost || 0,
      
      // Tracking
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
    // Destructure fields from request body
    const {
      // Lab Information
      labName,
      labAddress,
      labContact,
      labEmail,
      
      // Patient Information
      patientName,
      patientAge,
      patientGender,
      patientContact,
      
      // Sample/Test Information
      testType,
      sampleType,
      sampleCollectionDate,
      sampleSentDate,
      
      // Status and Results
      status,
      expectedResultDate,
      actualResultDate,
      resultReceived,
      resultUrl,
      
      // Additional Information
      remarks,
      urgency,
      cost
    } = req.body;

    const labPartner = await LabPartner.findById(req.params.id);

    if (!labPartner) {
      return res.status(404).json({
        success: false,
        message: 'Lab partner entry not found'
      });
    }

    // Validate patient gender if provided
    const validGenders = ['Male', 'Female', 'Other'];
    if (patientGender && !validGenders.includes(patientGender)) {
      return res.status(400).json({
        success: false,
        message: `Patient gender must be one of: ${validGenders.join(', ')}`
      });
    }

    // Validate status if provided
    const validStatuses = ['Sent to Lab', 'In Progress', 'Completed', 'Cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Validate urgency if provided
    const validUrgencies = ['Normal', 'Urgent', 'Critical'];
    if (urgency && !validUrgencies.includes(urgency)) {
      return res.status(400).json({
        success: false,
        message: `Urgency must be one of: ${validUrgencies.join(', ')}`
      });
    }

    // Validate patient age if provided
    if (patientAge !== undefined && (patientAge < 0 || patientAge > 150)) {
      return res.status(400).json({
        success: false,
        message: 'Patient age must be between 0 and 150'
      });
    }

    // Update fields only if provided
    if (labName !== undefined) labPartner.labName = labName;
    if (labAddress !== undefined) labPartner.labAddress = labAddress;
    if (labContact !== undefined) labPartner.labContact = labContact;
    if (labEmail !== undefined) labPartner.labEmail = labEmail;
    
    if (patientName !== undefined) labPartner.patientName = patientName;
    if (patientAge !== undefined) labPartner.patientAge = patientAge;
    if (patientGender !== undefined) labPartner.patientGender = patientGender;
    if (patientContact !== undefined) labPartner.patientContact = patientContact;
    
    if (testType !== undefined) labPartner.testType = testType;
    if (sampleType !== undefined) labPartner.sampleType = sampleType;
    if (sampleCollectionDate !== undefined) labPartner.sampleCollectionDate = new Date(sampleCollectionDate);
    if (sampleSentDate !== undefined) labPartner.sampleSentDate = new Date(sampleSentDate);
    
    if (status !== undefined) labPartner.status = status;
    if (expectedResultDate !== undefined) labPartner.expectedResultDate = new Date(expectedResultDate);
    if (actualResultDate !== undefined) labPartner.actualResultDate = new Date(actualResultDate);
    if (resultReceived !== undefined) labPartner.resultReceived = resultReceived;
    if (resultUrl !== undefined) labPartner.resultUrl = resultUrl;
    
    if (remarks !== undefined) labPartner.remarks = remarks;
    if (urgency !== undefined) labPartner.urgency = urgency;
    if (cost !== undefined) labPartner.cost = cost;

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
