import Blog from '../models/Blog.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Upload blog image
// @route   POST /api/blogs/upload-image
// @access  Private/Admin/Staff
export const uploadBlogImage = async (req, res) => {
  try {
    // Check if user is admin or staff
    if (req.user.role !== 'admin' && !req.user.isStaff) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Staff only.'
      });
    }

    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const file = req.files.image;

    // Check file type
    if (!file.mimetype.startsWith('image')) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Image size should be less than 5MB'
      });
    }

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'blogs',
      resource_type: 'image'
    });

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new blog (Admin/Staff)
// @route   POST /api/blogs
// @access  Private/Admin/Staff
export const createBlog = async (req, res) => {
  try {
    // Check if user is admin or staff
    if (req.user.role !== 'admin' && !req.user.isStaff) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Staff only.'
      });
    }

    const blogData = req.body;
    
    // Set author from authenticated user
    blogData.author = req.user._id;
    blogData.authorName = req.user.name;
    
    // Generate slug if not provided
    if (!blogData.slug && blogData.title) {
      blogData.slug = blogData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    
    // Check if slug already exists
    const existingBlog = await Blog.findOne({ slug: blogData.slug });
    if (existingBlog) {
      // Add timestamp to make slug unique
      blogData.slug = `${blogData.slug}-${Date.now()}`;
    }
    
    const blog = await Blog.create(blogData);
    
    await blog.populate('author', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all blogs (Admin)
// @route   GET /api/blogs/admin/all
// @access  Private/Admin
export const adminGetAllBlogs = async (req, res) => {
  try {
    const { category, status, author, isFeatured } = req.query;
    
    let query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (author) query.author = author;
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    
    const blogs = await Blog.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all published blogs (Public)
// @route   GET /api/blogs
// @access  Public
export const getAllBlogs = async (req, res) => {
  try {
    const { category, tag, isFeatured, limit = 10, page = 1 } = req.query;
    
    let query = { status: 'published', isActive: true };
    
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const blogs = await Blog.find(query)
      .populate('author', 'name email')
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Blog.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get blog by ID
// @route   GET /api/blogs/:id
// @access  Public
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name email');
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    // Increment views
    blog.views += 1;
    await blog.save();
    
    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get blog by slug
// @route   GET /api/blogs/slug/:slug
// @access  Public
export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate('author', 'name email');
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    // Increment views only for published blogs
    if (blog.status === 'published') {
      blog.views += 1;
      await blog.save();
    }
    
    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private/Admin/Staff
export const updateBlog = async (req, res) => {
  try {
    // Check if user is admin or staff
    if (req.user.role !== 'admin' && !req.user.isStaff) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Staff only.'
      });
    }

    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    // Check if user is author or admin
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog'
      });
    }
    
    // If slug is being updated, check for uniqueness
    if (req.body.slug && req.body.slug !== blog.slug) {
      const existingBlog = await Blog.findOne({ slug: req.body.slug });
      if (existingBlog) {
        return res.status(400).json({
          success: false,
          message: 'Slug already exists'
        });
      }
    }
    
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name email');
    
    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: updatedBlog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    await blog.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle blog status (publish/draft)
// @route   PUT /api/blogs/:id/toggle-status
// @access  Private/Admin/Staff
export const toggleBlogStatus = async (req, res) => {
  try {
    // Check if user is admin or staff
    if (req.user.role !== 'admin' && !req.user.isStaff) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Staff only.'
      });
    }

    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    // Toggle between draft and published
    blog.status = blog.status === 'published' ? 'draft' : 'published';
    
    if (blog.status === 'published' && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }
    
    await blog.save();
    
    res.status(200).json({
      success: true,
      message: `Blog ${blog.status === 'published' ? 'published' : 'unpublished'} successfully`,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle featured status
// @route   PUT /api/blogs/:id/toggle-featured
// @access  Private/Admin
export const toggleFeaturedStatus = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    blog.isFeatured = !blog.isFeatured;
    await blog.save();
    
    res.status(200).json({
      success: true,
      message: `Blog ${blog.isFeatured ? 'marked as featured' : 'unmarked as featured'}`,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Like blog
// @route   PUT /api/blogs/:id/like
// @access  Public
export const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }
    
    blog.likes += 1;
    await blog.save();
    
    res.status(200).json({
      success: true,
      message: 'Blog liked successfully',
      data: { likes: blog.likes }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get blogs by category
// @route   GET /api/blogs/category/:category
// @access  Public
export const getBlogsByCategory = async (req, res) => {
  try {
    const blogs = await Blog.find({
      category: req.params.category,
      status: 'published',
      isActive: true
    })
      .populate('author', 'name email')
      .sort({ publishedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Search blogs
// @route   GET /api/blogs/search
// @access  Public
export const searchBlogs = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const blogs = await Blog.find({
      status: 'published',
      isActive: true,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ]
    })
      .populate('author', 'name email')
      .sort({ publishedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
