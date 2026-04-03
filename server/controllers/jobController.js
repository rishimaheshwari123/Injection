import JobPost from '../models/JobPost.js';
import JobApplication from '../models/JobApplication.js';
import { v2 as cloudinary } from 'cloudinary';

// Get all active jobs (public)
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await JobPost.find({ 
      isActive: true,
      deadline: { $gte: new Date() }
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      jobs
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
};

// Get all jobs (admin)
export const getAllJobsAdmin = async (req, res) => {
  try {
    const jobs = await JobPost.find()
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      jobs
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
};

// Get single job
export const getJob = async (req, res) => {
  try {
    const job = await JobPost.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    res.status(200).json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job',
      error: error.message
    });
  }
};

// Create job (admin)
export const createJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.user._id
    };
    
    const job = await JobPost.create(jobData);
    
    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      job
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job',
      error: error.message
    });
  }
};

// Update job (admin)
export const updateJob = async (req, res) => {
  try {
    const job = await JobPost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job',
      error: error.message
    });
  }
};

// Delete job (admin)
export const deleteJob = async (req, res) => {
  try {
    const job = await JobPost.findByIdAndDelete(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Delete all applications for this job
    await JobApplication.deleteMany({ jobId: req.params.id });
    
    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job',
      error: error.message
    });
  }
};

// Apply for job (user)
export const applyForJob = async (req, res) => {
  try {
    const { jobId, name, email, phone, coverLetter } = req.body;
    
    // Check if job exists
    const job = await JobPost.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Check if already applied
    const existingApplication = await JobApplication.findOne({
      jobId,
      userId: req.user._id
    });
    
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }
    
    // Upload resume to Cloudinary
    if (!req.files || !req.files.resume) {
      return res.status(400).json({
        success: false,
        message: 'Resume is required'
      });
    }
    
    const result = await cloudinary.uploader.upload(req.files.resume.tempFilePath, {
      folder: 'job-applications',
      resource_type: 'auto'
    });
    
    const application = await JobApplication.create({
      jobId,
      userId: req.user._id,
      name,
      email,
      phone,
      coverLetter,
      resumeUrl: result.secure_url,
      resumePublicId: result.public_id
    });
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  }
};

// Get all applications for a job (admin)
export const getJobApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find({ jobId: req.params.jobId })
      .populate('userId', 'name email phone')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

// Get all applications (admin)
export const getAllApplications = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = {};
    
    if (status && status !== 'All') {
      query.status = status;
    }
    
    const applications = await JobApplication.find(query)
      .populate('userId', 'name email phone')
      .populate('jobId', 'title location')
      .sort({ createdAt: -1 });
    
    // Apply search filter after population
    let filteredApplications = applications;
    if (search) {
      filteredApplications = applications.filter(app => 
        app.name.toLowerCase().includes(search.toLowerCase()) ||
        app.email.toLowerCase().includes(search.toLowerCase()) ||
        app.jobId?.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.status(200).json({
      success: true,
      applications: filteredApplications
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

// Update application status (admin)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes },
      { new: true }
    ).populate('userId', 'name email')
     .populate('jobId', 'title');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application',
      error: error.message
    });
  }
};

// Get user's applications
export const getMyApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find({ userId: req.user._id })
      .populate('jobId', 'title location jobType')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};
