import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  ArrowLeft, 
  Tag, 
  Eye, 
  Share2, 
  Heart,
  Star,
  AlertTriangle,
  Info
} from 'lucide-react';
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
  featuredImageAlt?: string;
  views: number;
  likes: number;
  readingTime: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
    email: string;
  };
  authorName: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  focusKeyword?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  noIndex?: boolean;
  faq?: { question: string; answer: string }[];
  schemaMarkup?: {
    articleSchema: boolean;
    faqPageSchema: boolean;
    breadcrumbSchema: boolean;
  };
  status?: "draft" | "published" | "archived";
  isFeatured?: boolean;
}

function FAQAccordionItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
      >
        <span>{question}</span>
        <span className={`transform transition-transform duration-300 text-teal-600 font-bold ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div 
        className={`transition-all duration-350 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-96 border-t border-gray-150 p-5' : 'max-h-0'
        }`}
      >
        <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{answer}</p>
      </div>
    </div>
  );
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

  // Handle SEO Meta tags and JSON-LD Schema Markups dynamically
  useEffect(() => {
    if (blog) {
      // 1. Update document title
      document.title = blog.metaTitle || blog.title;

      // Helper to create or update meta tag
      const setMetaTag = (nameOrProperty: string, content: string, isProperty = false) => {
        const selector = isProperty 
          ? `meta[property="${nameOrProperty}"]` 
          : `meta[name="${nameOrProperty}"]`;
        let element = document.querySelector(selector);
        if (!element) {
          element = document.createElement('meta');
          if (isProperty) {
            element.setAttribute('property', nameOrProperty);
          } else {
            element.setAttribute('name', nameOrProperty);
          }
          document.head.appendChild(element);
        }
        element.setAttribute('content', content);
      };

      // Set meta tags
      setMetaTag('description', blog.metaDescription || blog.excerpt || '');
      if (blog.focusKeyword) {
        setMetaTag('keywords', blog.metaKeywords?.join(', ') || blog.focusKeyword);
      }

      // Robots NoIndex
      if (blog.noIndex) {
        setMetaTag('robots', 'noindex, nofollow');
      } else {
        setMetaTag('robots', 'index, follow');
      }

      // Open Graph Tags
      setMetaTag('og:title', blog.ogTitle || blog.title, true);
      setMetaTag('og:description', blog.ogDescription || blog.excerpt || '', true);
      if (blog.featuredImage) {
        setMetaTag('og:image', blog.featuredImage, true);
      }
      setMetaTag('og:type', 'article', true);
      setMetaTag('og:url', window.location.href, true);

      // Canonical link tag
      let canonicalElement = document.querySelector('link[rel="canonical"]');
      if (!canonicalElement) {
        canonicalElement = document.createElement('link');
        canonicalElement.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalElement);
      }
      canonicalElement.setAttribute('href', blog.canonicalUrl || window.location.href);

      // 2. Schema Injection
      const schemaMarkup = blog.schemaMarkup || { articleSchema: true, faqPageSchema: false, breadcrumbSchema: true };
      const scriptTags: HTMLScriptElement[] = [];

      const addSchema = (id: string, schemaObj: object) => {
        const existing = document.getElementById(id);
        if (existing) existing.remove();

        const script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        script.text = JSON.stringify(schemaObj);
        document.head.appendChild(script);
        scriptTags.push(script);
      };

      // Article Schema
      if (schemaMarkup.articleSchema) {
        addSchema('jsonld-article', {
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          'headline': blog.title,
          'image': [blog.featuredImage].filter(Boolean),
          'datePublished': blog.publishedAt || blog.createdAt,
          'dateModified': blog.updatedAt || blog.createdAt,
          'author': {
            '@type': 'Person',
            'name': blog.authorName || blog.author?.name || 'Admin',
          }
        });
      }

      // FAQ Page Schema
      if (schemaMarkup.faqPageSchema && blog.faq && blog.faq.length > 0) {
        addSchema('jsonld-faq', {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          'mainEntity': blog.faq.map(item => ({
            '@type': 'Question',
            'name': item.question,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': item.answer
            }
          }))
        });
      }

      // Breadcrumb Schema
      if (schemaMarkup.breadcrumbSchema) {
        addSchema('jsonld-breadcrumb', {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Home',
              'item': window.location.origin
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': 'Blog',
              'item': `${window.location.origin}/blog`
            },
            {
              '@type': 'ListItem',
              'position': 3,
              'name': blog.title,
              'item': window.location.href
            }
          ]
        });
      }

      // Cleanup dynamically injected tags on unmount
      return () => {
        scriptTags.forEach(tag => tag.remove());
      };
    }
  }, [blog]);

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

  const handleLike = async () => {
    if (!blog) return;
    try {
      const response = await blogAPI.likeBlog(blog._id);
      if (response.data.success) {
        setBlog(prev => prev ? { ...prev, likes: (prev.likes || 0) + 1 } : null);
      }
    } catch (error) {
      console.error('Error liking blog:', error);
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
      {/* Draft Preview Banner */}
      {blog.status === 'draft' && (
        <div className="bg-amber-500 text-white text-center py-2.5 px-4 font-semibold text-sm flex items-center justify-center gap-2 shadow-inner">
          <AlertTriangle size={18} className="animate-pulse" />
          <span>Preview Mode: This blog post is currently saved as a draft and is not visible to the public.</span>
        </div>
      )}

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
            {/* Visual Breadcrumbs */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-teal-100/70 mb-4 font-medium">
              <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/')}>Home</span>
              <span>/</span>
              <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/blog')}>Blog</span>
              <span>/</span>
              <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate(`/blog?category=${blog.category}`)}>{blog.category}</span>
              <span>/</span>
              <span className="text-white font-semibold truncate max-w-[200px]">{blog.title}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-teal-500 px-4 py-1 rounded-full text-sm font-medium">
                {blog.category}
              </span>
              {blog.isFeatured && (
                <span className="bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                  <Star size={12} className="fill-current" />
                  <span>Featured</span>
                </span>
              )}
              {blog.status && blog.status !== 'published' && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                  blog.status === 'draft' ? 'bg-amber-500 text-white border border-amber-400/30' :
                  'bg-rose-500 text-white border border-rose-400/30'
                }`}>
                  {blog.status}
                </span>
              )}
              <span className="text-teal-100">•</span>
              <span className="text-teal-100 flex items-center gap-1 font-medium">
                <Clock size={16} />
                {blog.readingTime} min read
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-teal-100">
              <div className="flex items-center gap-2 font-medium">
                <User size={18} />
                <span>{blog.authorName || blog.author?.name}</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Calendar size={18} />
                <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Eye size={18} />
                <span>{blog.views} views</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Heart size={18} className="fill-rose-400 text-rose-400" />
                <span>{blog.likes || 0} likes</span>
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
            alt={blog.featuredImageAlt || blog.title}
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
              className="text-gray-700 leading-relaxed [&_a]:text-teal-600 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-teal-800 [&_a]:font-medium transition-all [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-teal-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-bold"
              dangerouslySetInnerHTML={{ 
                __html: (blog.content.trim().startsWith('<') || blog.content.includes('</')) 
                  ? blog.content 
                  : blog.content
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

          {/* Meta Publishing Auditor Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.52 }}
            className="mt-12 pt-8 border-t-2 border-gray-100"
          >
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-3.5 text-sm">
              <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[11px] tracking-wider mb-2 select-none">
                <Info size={14} className="text-slate-400" />
                <span>Meta Publishing Auditor</span>
              </div>
              
              <div className="space-y-2.5 text-slate-600">
                <div>
                  <span className="text-slate-400 font-bold mr-1.5">Meta Title:</span>
                  <span className="text-slate-700 font-semibold">{blog.metaTitle || blog.title}</span>
                </div>
                
                <div>
                  <span className="text-slate-400 font-bold mr-1.5">Meta Description:</span>
                  <span className="text-slate-700 font-medium leading-relaxed">{blog.metaDescription || blog.excerpt || 'No description provided.'}</span>
                </div>
                
                <div>
                  <span className="text-slate-400 font-bold mr-1.5">Canonical URL:</span>
                  <a 
                    href={blog.canonicalUrl || window.location.href} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-orange-600 hover:underline font-semibold"
                  >
                    {blog.canonicalUrl || window.location.href}
                  </a>
                </div>
                
                <div>
                  <span className="text-slate-400 font-bold mr-1.5">Indexing Status:</span>
                  <span className={blog.noIndex ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {blog.noIndex ? 'noindex, nofollow (SEO hidden)' : 'index, follow (SEO discoverable)'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FAQ Section */}
          {blog.faq && blog.faq.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="mt-12 pt-8 border-t-2 border-gray-100"
            >
              <div className="space-y-4">
                {blog.faq.map((item, idx) => (
                  <FAQAccordionItem key={idx} question={item.question} answer={item.answer} />
                ))}
              </div>
            </motion.div>
          )}


          {/* Share & Like Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 pt-8 border-t-2 border-gray-100"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                  <User size={24} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{blog.authorName || blog.author?.name}</p>
                  <p className="text-sm text-gray-500 font-medium">Medical Expert</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 border border-rose-200 text-rose-600 px-5 py-2.5 rounded-lg hover:bg-rose-50 transition-colors font-medium text-sm"
                >
                  <Heart size={16} className="fill-rose-600 text-rose-600" />
                  <span>Like ({blog.likes || 0})</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm"
                >
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
              </div>
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
