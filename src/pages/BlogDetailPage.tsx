import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowLeft, Tag, Eye, Share2 } from 'lucide-react';
import { blogAPI } from '../services/api';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  featuredImage: string;
  views: number;
  likes: number;
  readingTime: number;
  publishedAt: string;
  author: {
    name: string;
    email: string;
  };
  authorName: string;
}

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getBlogBySlug(slug!);
      setBlog(response.data.data);
      
      // Fetch related blogs from same category
      if (response.data.data.category) {
        const relatedResponse = await blogAPI.getBlogsByCategory(response.data.data.category);
        setRelatedBlogs(relatedResponse.data.data.filter((b: Blog) => b.slug !== slug).slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog?.title,
        text: blog?.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Blog not found</p>
          <button
            onClick={() => navigate('/blog')}
            className="mt-4 text-teal-600 hover:text-teal-800 font-medium"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-teal-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Blogs</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-teal-500 px-4 py-1 rounded-full text-sm font-medium">
                {blog.category}
              </span>
              <span className="text-teal-100">•</span>
              <span className="text-teal-100 flex items-center gap-1">
                <Clock size={16} />
                {blog.readingTime} min read
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-teal-100">
              <div className="flex items-center gap-2">
                <User size={18} />
                <span>{blog.authorName || blog.author?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>{formatDate(blog.publishedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye size={18} />
                <span>{blog.views} views</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Featured Image */}
      {blog.featuredImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12"
        >
          <img
            src={blog.featuredImage}
            alt={blog.title}
            className="w-full h-[400px] object-cover rounded-2xl shadow-2xl"
          />
        </motion.div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Excerpt */}
          {blog.excerpt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-700 italic mb-8 pb-8 border-b-2 border-gray-100 leading-relaxed"
            >
              {blog.excerpt}
            </motion.div>
          )}

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="prose prose-lg max-w-none"
          >
            <div 
              className="text-gray-700 leading-relaxed whitespace-pre-wrap [&_a]:text-teal-600 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-teal-800 [&_a]:font-medium transition-all"
              dangerouslySetInnerHTML={{ 
                __html: blog.content
                  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
                    const isExternal = url.startsWith('http://') || url.startsWith('https://');
                    const target = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';
                    return `<a href="${url}" ${target}>${text}</a>`;
                  })
                  .replace(/\n/g, '<br />')
              }} 
            />
          </motion.div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 pt-8 border-t-2 border-gray-100"
            >
              <div className="flex items-center gap-2 mb-4">
                <Tag size={20} className="text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-500 uppercase">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-teal-100 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Share Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 pt-8 border-t-2 border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                  <User size={24} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{blog.authorName || blog.author?.name}</p>
                  <p className="text-sm text-gray-500">Medical Expert</p>
                </div>
              </div>
              
              <button
                onClick={handleShare}
                className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Share2 size={18} />
                <span>Share</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Related Blogs */}
        {relatedBlogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog) => (
                <div
                  key={relatedBlog._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => navigate(`/blog/${relatedBlog.slug}`)}
                >
                  {relatedBlog.featuredImage ? (
                    <img
                      src={relatedBlog.featuredImage}
                      alt={relatedBlog.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-r from-teal-400 to-blue-500 flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">{relatedBlog.title.charAt(0)}</span>
                    </div>
                  )}
                  <div className="p-6">
                    <span className="text-xs font-medium text-teal-600 uppercase">{relatedBlog.category}</span>
                    <h3 className="font-semibold text-gray-900 mt-2 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                      {relatedBlog.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {relatedBlog.excerpt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
