import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  // Blog Information
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  content: {
    type: String,
    required: [true, 'Blog content is required']
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  
  // Media
  featuredImage: {
    type: String,
    default: null
  },
  images: [{
    type: String
  }],
  
  // Categorization
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Healthcare',
      'Research',
      'Training',
      'Technology',
      'News',
      'Tips & Advice',
      'Case Studies',
      'Industry Updates',
      'Other'
    ]
  },
  tags: [{
    type: String,
    trim: true
  }],
  
  // Author
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  authorName: {
    type: String,
    trim: true
  },
  
  // SEO
  metaTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'Meta title cannot exceed 60 characters']
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  metaKeywords: [{
    type: String,
    trim: true
  }],
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Publishing
  publishedAt: {
    type: Date,
    default: null
  },
  
  // Engagement
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  
  // Reading Time
  readingTime: {
    type: Number, // in minutes
    default: 5
  }
}, {
  timestamps: true
});

// Indexes
// Note: slug field already has unique: true, so no need for separate index
blogSchema.index({ status: 1, isActive: 1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ publishedAt: -1 });

// Generate slug from title before saving
blogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Set published date when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Calculate reading time based on content
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / wordsPerMinute);
  }
  
  next();
});

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
