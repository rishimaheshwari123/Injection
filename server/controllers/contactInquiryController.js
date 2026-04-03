import ContactInquiry from '../models/ContactInquiry.js';

// Create contact inquiry (public)
export const createInquiry = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const inquiry = new ContactInquiry({
      name,
      email,
      phone,
      message
    });

    await inquiry.save();

    res.status(201).json({
      success: true,
      message: 'Contact inquiry submitted successfully',
      inquiry
    });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact inquiry',
      error: error.message
    });
  }
};

// Get all inquiries (admin)
export const getAllInquiries = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let query = {};
    
    if (status && status !== 'All') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { inquiryNumber: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const inquiries = await ContactInquiry.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      inquiries
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiries',
      error: error.message
    });
  }
};

// Get single inquiry
export const getInquiry = async (req, res) => {
  try {
    const inquiry = await ContactInquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      inquiry
    });
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inquiry',
      error: error.message
    });
  }
};

// Update inquiry status (admin)
export const updateInquiryStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const updateData = {
      status,
      adminNotes
    };

    if (status === 'Responded') {
      updateData.respondedAt = new Date();
    }

    if (status === 'Closed') {
      updateData.closedAt = new Date();
    }

    const inquiry = await ContactInquiry.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry updated successfully',
      inquiry
    });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inquiry',
      error: error.message
    });
  }
};

// Delete inquiry (admin)
export const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await ContactInquiry.findByIdAndDelete(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: 'Inquiry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inquiry',
      error: error.message
    });
  }
};

// Get inquiry statistics (admin)
export const getInquiryStats = async (req, res) => {
  try {
    const totalInquiries = await ContactInquiry.countDocuments();
    const newInquiries = await ContactInquiry.countDocuments({ status: 'New' });
    const readInquiries = await ContactInquiry.countDocuments({ status: 'Read' });
    const respondedInquiries = await ContactInquiry.countDocuments({ status: 'Responded' });
    const closedInquiries = await ContactInquiry.countDocuments({ status: 'Closed' });

    res.status(200).json({
      success: true,
      stats: {
        total: totalInquiries,
        new: newInquiries,
        read: readInquiries,
        responded: respondedInquiries,
        closed: closedInquiries
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};
