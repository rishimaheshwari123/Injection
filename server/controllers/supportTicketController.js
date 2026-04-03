import SupportTicket from '../models/SupportTicket.js';

// Create support ticket (public)
export const createTicket = async (req, res) => {
  try {
    const { name, email, phone, subject, category, message, priority } = req.body;

    const ticket = new SupportTicket({
      name,
      email,
      phone,
      subject,
      category,
      message,
      priority: priority || 'Medium'
    });

    await ticket.save();

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      ticket
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create support ticket',
      error: error.message
    });
  }
};

// Get all tickets (admin)
export const getAllTickets = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    
    let query = {};
    
    if (status && status !== 'All') {
      query.status = status;
    }
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { ticketNumber: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const tickets = await SupportTicket.find(query)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tickets
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
      error: error.message
    });
  }
};

// Get single ticket
export const getTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.status(200).json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket',
      error: error.message
    });
  }
};

// Update ticket status (admin)
export const updateTicketStatus = async (req, res) => {
  try {
    const { status, adminNotes, assignedTo } = req.body;
    
    const updateData = {
      status,
      adminNotes
    };

    if (assignedTo) {
      updateData.assignedTo = assignedTo;
    }

    if (status === 'Resolved') {
      updateData.resolvedAt = new Date();
    }

    if (status === 'Closed') {
      updateData.closedAt = new Date();
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      ticket
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket',
      error: error.message
    });
  }
};

// Delete ticket (admin)
export const deleteTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete ticket',
      error: error.message
    });
  }
};

// Get ticket statistics (admin)
export const getTicketStats = async (req, res) => {
  try {
    const totalTickets = await SupportTicket.countDocuments();
    const pendingTickets = await SupportTicket.countDocuments({ status: 'Pending' });
    const inProgressTickets = await SupportTicket.countDocuments({ status: 'In Progress' });
    const resolvedTickets = await SupportTicket.countDocuments({ status: 'Resolved' });
    const closedTickets = await SupportTicket.countDocuments({ status: 'Closed' });

    res.status(200).json({
      success: true,
      stats: {
        total: totalTickets,
        pending: pendingTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
        closed: closedTickets
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
