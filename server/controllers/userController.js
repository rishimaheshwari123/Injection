import User from '../models/User.js';
import UserReview from '../models/UserReview.js';
import jwt from 'jsonwebtoken';
import cloudinary from '../config/cloudinary.js';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

const uploadToCloudinary = async (file, folder = 'patients') => {
  if (!file) return null;
  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder,
      resource_type: 'auto'
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary: ' + error.message);
  }
};

export const userRegister = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      gender,
      age,
      address,
      pincode,
      alternateMobile,
      currentLocation,
      hasInsurance,
      insurancePolicyNumber,
      insuranceProvider,
      insuranceExpiryDate,
      bloodGroup,
      allergies,
      chronicDiseases,
      currentMedications,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      additionalNotes,
      preferredLanguage,
      role,
      isActive,
      isStaff,
      permissions,
      profileImage,
      medicalReport,
      bloodReport,
      historyDocument,
      otherDocument
    } = req.body;

    // Validation
    if (!name || !email || !password || !phone || !gender || !age || !address || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, phone, gender, age, address, pincode'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Phone validation
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number (7 to 15 digits)'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Parse JSON arrays/objects
    let parsedAllergies = [];
    let parsedChronicDiseases = [];
    let parsedCurrentMedications = [];
    let parsedPermissions = undefined;

    try {
      parsedAllergies = typeof allergies === 'string' ? JSON.parse(allergies) : (allergies || []);
    } catch (e) {
      console.error('Error parsing allergies:', e);
    }

    try {
      parsedChronicDiseases = typeof chronicDiseases === 'string' ? JSON.parse(chronicDiseases) : (chronicDiseases || []);
    } catch (e) {
      console.error('Error parsing chronicDiseases:', e);
    }

    try {
      parsedCurrentMedications = typeof currentMedications === 'string' ? JSON.parse(currentMedications) : (currentMedications || []);
    } catch (e) {
      console.error('Error parsing currentMedications:', e);
    }

    try {
      parsedPermissions = typeof permissions === 'string' ? JSON.parse(permissions) : permissions;
    } catch (e) {
      console.error('Error parsing permissions:', e);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      gender,
      age,
      address,
      pincode,
      alternateMobile: alternateMobile || '',
      currentLocation: currentLocation || '',
      hasInsurance: hasInsurance === 'true' || hasInsurance === true,
      insurancePolicyNumber: insurancePolicyNumber || '',
      insuranceProvider: insuranceProvider || '',
      insuranceExpiryDate: insuranceExpiryDate || null,
      bloodGroup: bloodGroup || 'Unknown',
      allergies: parsedAllergies,
      chronicDiseases: parsedChronicDiseases,
      currentMedications: parsedCurrentMedications,
      emergencyContactName: emergencyContactName || '',
      emergencyContactPhone: emergencyContactPhone || '',
      emergencyContactRelation: emergencyContactRelation || '',
      additionalNotes: additionalNotes || '',
      preferredLanguage: preferredLanguage || 'English',
      role: role === 'admin' ? 'admin' : 'user',
      isActive: isActive === 'false' || isActive === false ? false : true,
      isStaff: isStaff === 'true' || isStaff === true ? true : false,
      permissions: parsedPermissions,
      profileImage: profileImage || null,
      medicalReport: medicalReport || null,
      bloodReport: bloodReport || null,
      historyDocument: historyDocument || null,
      otherDocument: otherDocument || null
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.'
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: { $ne: false } }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const updateUserProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      gender,
      age,
      address,
      pincode,
      alternateMobile,
      currentLocation,
      hasInsurance,
      insurancePolicyNumber,
      insuranceProvider,
      insuranceExpiryDate,
      bloodGroup,
      allergies,
      chronicDiseases,
      currentMedications,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      additionalNotes,
      preferredLanguage,
      profileImage,
      medicalReport,
      bloodReport,
      historyDocument,
      otherDocument
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validation for allowed fields if passed
    if (name !== undefined && !name) {
      return res.status(400).json({ success: false, message: 'Name cannot be empty' });
    }
    if (phone !== undefined && !phone) {
      return res.status(400).json({ success: false, message: 'Phone number cannot be empty' });
    }
    if (phone !== undefined) {
      const phoneRegex = /^\+?[0-9]{7,15}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid phone number' });
      }
    }
    if (gender !== undefined && !gender) {
      return res.status(400).json({ success: false, message: 'Gender cannot be empty' });
    }
    if (age !== undefined && !age) {
      return res.status(400).json({ success: false, message: 'Age cannot be empty' });
    }
    if (address !== undefined && !address) {
      return res.status(400).json({ success: false, message: 'Address cannot be empty' });
    }
    if (pincode !== undefined && !pincode) {
      return res.status(400).json({ success: false, message: 'Pincode cannot be empty' });
    }

    // Update fields if provided, otherwise preserve existing values
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (gender !== undefined) user.gender = gender;
    if (age !== undefined) user.age = age;
    if (address !== undefined) user.address = address;
    if (pincode !== undefined) user.pincode = pincode;
    if (alternateMobile !== undefined) user.alternateMobile = alternateMobile;
    if (currentLocation !== undefined) user.currentLocation = currentLocation;
    if (hasInsurance !== undefined) user.hasInsurance = hasInsurance === 'true' || hasInsurance === true;
    if (insurancePolicyNumber !== undefined) user.insurancePolicyNumber = insurancePolicyNumber;
    if (insuranceProvider !== undefined) user.insuranceProvider = insuranceProvider;
    if (insuranceExpiryDate !== undefined) user.insuranceExpiryDate = insuranceExpiryDate;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (emergencyContactName !== undefined) user.emergencyContactName = emergencyContactName;
    if (emergencyContactPhone !== undefined) user.emergencyContactPhone = emergencyContactPhone;
    if (emergencyContactRelation !== undefined) user.emergencyContactRelation = emergencyContactRelation;
    if (additionalNotes !== undefined) user.additionalNotes = additionalNotes;
    if (preferredLanguage !== undefined) user.preferredLanguage = preferredLanguage;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (medicalReport !== undefined) user.medicalReport = medicalReport;
    if (bloodReport !== undefined) user.bloodReport = bloodReport;
    if (historyDocument !== undefined) user.historyDocument = historyDocument;
    if (otherDocument !== undefined) user.otherDocument = otherDocument;

    // Handle nested medical items
    if (allergies !== undefined) {
      try {
        user.allergies = typeof allergies === 'string' ? JSON.parse(allergies) : allergies;
      } catch (e) {
        console.error('Error parsing allergies:', e);
      }
    }
    if (chronicDiseases !== undefined) {
      try {
        user.chronicDiseases = typeof chronicDiseases === 'string' ? JSON.parse(chronicDiseases) : chronicDiseases;
      } catch (e) {
        console.error('Error parsing chronicDiseases:', e);
      }
    }
    if (currentMedications !== undefined) {
      try {
        user.currentMedications = typeof currentMedications === 'string' ? JSON.parse(currentMedications) : currentMedications;
      } catch (e) {
        console.error('Error parsing currentMedications:', e);
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const createUserByAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      gender,
      age,
      address,
      pincode,
      alternateMobile,
      currentLocation,
      hasInsurance,
      insurancePolicyNumber,
      insuranceProvider,
      insuranceExpiryDate,
      bloodGroup,
      allergies,
      chronicDiseases,
      currentMedications,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      additionalNotes,
      preferredLanguage,
      role,
      isActive,
      isStaff,
      permissions,
      profileImage,
      medicalReport,
      bloodReport,
      historyDocument,
      otherDocument
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Validation
    if (!name || !email || !password || !phone || !gender || !age || !address || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, phone, gender, age, address, pincode'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Phone validation
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number (7 to 15 digits)'
      });
    }

    // Parse JSON arrays/objects
    let parsedAllergies = [];
    let parsedChronicDiseases = [];
    let parsedCurrentMedications = [];
    let parsedPermissions = undefined;

    try {
      parsedAllergies = typeof allergies === 'string' ? JSON.parse(allergies) : (allergies || []);
    } catch (e) {
      console.error('Error parsing allergies:', e);
    }

    try {
      parsedChronicDiseases = typeof chronicDiseases === 'string' ? JSON.parse(chronicDiseases) : (chronicDiseases || []);
    } catch (e) {
      console.error('Error parsing chronicDiseases:', e);
    }

    try {
      parsedCurrentMedications = typeof currentMedications === 'string' ? JSON.parse(currentMedications) : (currentMedications || []);
    } catch (e) {
      console.error('Error parsing currentMedications:', e);
    }

    try {
      parsedPermissions = typeof permissions === 'string' ? JSON.parse(permissions) : permissions;
    } catch (e) {
      console.error('Error parsing permissions:', e);
    }

    // Create user with all provided data
    const user = await User.create({
      name,
      email,
      password,
      phone,
      gender,
      age,
      address,
      pincode,
      alternateMobile: alternateMobile || '',
      currentLocation: currentLocation || '',
      hasInsurance: hasInsurance === 'true' || hasInsurance === true,
      insurancePolicyNumber: insurancePolicyNumber || '',
      insuranceProvider: insuranceProvider || '',
      insuranceExpiryDate: insuranceExpiryDate || null,
      bloodGroup: bloodGroup || 'Unknown',
      allergies: parsedAllergies,
      chronicDiseases: parsedChronicDiseases,
      currentMedications: parsedCurrentMedications,
      emergencyContactName: emergencyContactName || '',
      emergencyContactPhone: emergencyContactPhone || '',
      emergencyContactRelation: emergencyContactRelation || '',
      additionalNotes: additionalNotes || '',
      preferredLanguage: preferredLanguage || 'English',
      role: role || 'user',
      isActive: isActive === 'false' || isActive === false ? false : true,
      isStaff: isStaff === 'true' || isStaff === true ? true : false,
      permissions: parsedPermissions,
      profileImage: profileImage || null,
      medicalReport: medicalReport || null,
      bloodReport: bloodReport || null,
      historyDocument: historyDocument || null,
      otherDocument: otherDocument || null
    });

    res.status(201).json({
      success: true,
      message: 'User/Patient created successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateUserByAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      gender,
      age,
      address,
      pincode,
      alternateMobile,
      currentLocation,
      hasInsurance,
      insurancePolicyNumber,
      insuranceProvider,
      insuranceExpiryDate,
      bloodGroup,
      allergies,
      chronicDiseases,
      currentMedications,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      additionalNotes,
      preferredLanguage,
      role,
      isActive,
      isStaff,
      permissions,
      profileImage,
      medicalReport,
      bloodReport,
      historyDocument,
      otherDocument
    } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validation for required fields if they are passed
    if (name !== undefined && !name) {
      return res.status(400).json({ success: false, message: 'Name cannot be empty' });
    }
    if (email !== undefined && !email) {
      return res.status(400).json({ success: false, message: 'Email cannot be empty' });
    }
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
      }
      const emailTaken = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailTaken) {
        return res.status(400).json({ success: false, message: 'Email is already in use by another account' });
      }
    }
    if (phone !== undefined && !phone) {
      return res.status(400).json({ success: false, message: 'Phone number cannot be empty' });
    }
    if (phone !== undefined) {
      const phoneRegex = /^\+?[0-9]{7,15}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid phone number' });
      }
    }
    if (gender !== undefined && !gender) {
      return res.status(400).json({ success: false, message: 'Gender cannot be empty' });
    }
    if (age !== undefined && !age) {
      return res.status(400).json({ success: false, message: 'Age cannot be empty' });
    }
    if (address !== undefined && !address) {
      return res.status(400).json({ success: false, message: 'Address cannot be empty' });
    }
    if (pincode !== undefined && !pincode) {
      return res.status(400).json({ success: false, message: 'Pincode cannot be empty' });
    }

    // Update fields if provided, otherwise preserve existing
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (gender !== undefined) user.gender = gender;
    if (age !== undefined) user.age = age;
    if (address !== undefined) user.address = address;
    if (pincode !== undefined) user.pincode = pincode;
    if (alternateMobile !== undefined) user.alternateMobile = alternateMobile;
    if (currentLocation !== undefined) user.currentLocation = currentLocation;
    if (hasInsurance !== undefined) user.hasInsurance = hasInsurance === 'true' || hasInsurance === true;
    if (insurancePolicyNumber !== undefined) user.insurancePolicyNumber = insurancePolicyNumber;
    if (insuranceProvider !== undefined) user.insuranceProvider = insuranceProvider;
    if (insuranceExpiryDate !== undefined) user.insuranceExpiryDate = insuranceExpiryDate;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (emergencyContactName !== undefined) user.emergencyContactName = emergencyContactName;
    if (emergencyContactPhone !== undefined) user.emergencyContactPhone = emergencyContactPhone;
    if (emergencyContactRelation !== undefined) user.emergencyContactRelation = emergencyContactRelation;
    if (additionalNotes !== undefined) user.additionalNotes = additionalNotes;
    if (preferredLanguage !== undefined) user.preferredLanguage = preferredLanguage;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive === 'false' || isActive === false ? false : true;
    if (isStaff !== undefined) user.isStaff = isStaff === 'true' || isStaff === true ? true : false;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (medicalReport !== undefined) user.medicalReport = medicalReport;
    if (bloodReport !== undefined) user.bloodReport = bloodReport;
    if (historyDocument !== undefined) user.historyDocument = historyDocument;
    if (otherDocument !== undefined) user.otherDocument = otherDocument;

    // Handle nested medical items
    if (allergies !== undefined) {
      try {
        user.allergies = typeof allergies === 'string' ? JSON.parse(allergies) : allergies;
      } catch (e) {
        console.error('Error parsing allergies:', e);
      }
    }
    if (chronicDiseases !== undefined) {
      try {
        user.chronicDiseases = typeof chronicDiseases === 'string' ? JSON.parse(chronicDiseases) : chronicDiseases;
      } catch (e) {
        console.error('Error parsing chronicDiseases:', e);
      }
    }
    if (currentMedications !== undefined) {
      try {
        user.currentMedications = typeof currentMedications === 'string' ? JSON.parse(currentMedications) : currentMedications;
      } catch (e) {
        console.error('Error parsing currentMedications:', e);
      }
    }

    // Handle permissions separately
    if (permissions !== undefined) {
      try {
        user.permissions = typeof permissions === 'string' ? JSON.parse(permissions) : permissions;
      } catch (e) {
        console.error('Error parsing permissions:', e);
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User/Patient updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// @desc    Upload user file (profile image or documents) to Cloudinary
// @route   POST /api/users/upload
// @access  Private
export const uploadUserFile = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded.'
      });
    }

    const file = req.files.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file under "file" key.'
      });
    }

    const folder = req.body.folder || 'patients';
    const fileUrl = await uploadToCloudinary(file, folder);

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      url: fileUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User account activated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User account deactivated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete: set isActive to false instead of deleting
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const getAllUsersByPagination = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = { isActive: { $ne: false } };

    if (search) {
      query.$or = [
        { patientId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limitNum);

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: users.length,
      totalUsers,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all reviews for a user/customer
// @route   GET /api/users/:id/reviews
// @access  Private
export const getUserReviews = async (req, res) => {
  try {
    const reviews = await UserReview.find({ userId: req.params.id })
      .populate('vendorId', 'name businessName profileImage')
      .populate('bookingId', 'selectedServices preferredTimeSlot bookingStatus')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
