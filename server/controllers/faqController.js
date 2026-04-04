import FAQ from '../models/FAQ.js';

// Get all FAQs (public)
export const getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all FAQs (admin - includes inactive)
export const getAllFAQsAdmin = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get FAQ by ID
export const getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create FAQ
export const createFAQ = async (req, res) => {
  try {
    // Destructure and validate fields from request body
    const {
      question,
      answer,
      category,
      isActive
    } = req.body;

    // Validate required fields
    if (!question || !answer) {
      return res.status(400).json({ 
        message: 'Question and answer are required' 
      });
    }

    // Validate category if provided
    const validCategories = ['general', 'services', 'booking', 'payment', 'insurance', 'other'];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({ 
        message: `Category must be one of: ${validCategories.join(', ')}` 
      });
    }

    // Create FAQ with validated data
    const faq = await FAQ.create({
      question,
      answer,
      category: category || 'general',
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json(faq);
  } catch (error) {
    res.status(400).json({ message: 'Error creating FAQ', error: error.message });
  }
};

// Update FAQ
export const updateFAQ = async (req, res) => {
  try {
    // Destructure fields from request body
    const {
      question,
      answer,
      category,
      isActive
    } = req.body;

    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    // Validate category if provided
    const validCategories = ['general', 'services', 'booking', 'payment', 'insurance', 'other'];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({ 
        message: `Category must be one of: ${validCategories.join(', ')}` 
      });
    }

    // Update fields only if provided
    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;
    if (category !== undefined) faq.category = category;
    if (isActive !== undefined) faq.isActive = isActive;

    await faq.save();
    res.json(faq);
  } catch (error) {
    res.status(400).json({ message: 'Error updating FAQ', error: error.message });
  }
};

// Delete FAQ
export const deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
