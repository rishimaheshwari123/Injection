import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  User,
  ArrowRight,
  Tag,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { blogAPI } from "../services/api";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  featuredImage: string;
  views: number;
  likes: number;
  readingTime: number;
  publishedAt: string;
  author: {
    name: string;
  };
  authorName: string;
}

const BlogPage = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 9;

  const categories = [
    "All",
    "Healthcare",
    "Research",
    "Training",
    "Technology",
    "News",
  ];

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, selectedCategory]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit,
        category: selectedCategory === "All" ? "" : selectedCategory,
      };
      const response = await blogAPI.getAllBlogs(params);
      if (response.data.success) {
        setBlogs(response.data.data);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredBlogs = blogs;

  return (
    <div>
      <Helmet>
        <title>
          Healthcare Blog | Health Tips, Medical Insights & Wellness Articles |
          PRLT Healthcare
        </title>
        <meta
          name="description"
          content="Explore the PRLT Healthcare Blog for expert health tips, medical insights, home healthcare guidance, wellness advice, patient care information, and healthcare industry updates to help you live a healthier life."
        />
        <meta
          name="keywords"
          content="Healthcare Blog, Health Tips Blog, Medical Insights, Healthcare Articles, Patient Care Tips, Home Healthcare Blog, Wellness Articles, Healthcare News, Medical Advice Blog, Healthy Living Tips, Healthcare Education, Health Awareness Articles, Nursing Care Tips, Elderly Care Advice, Preventive Healthcare"
        />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-50 to-blue-50 py-20">
        <div className="w-[90vw] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Blog & Insights
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Stay updated with the latest healthcare trends, research findings,
              and expert insights from PRLT Health Care and Research Solutions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="w-[90vw] mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category, index) => (
              <motion.button
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Articles - From Database */}
      {loading ? (
        <div className="py-20 text-center bg-gray-50">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Loading blogs...</p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="py-20 text-center bg-gray-50">
          <p className="text-gray-600 text-lg">No blogs found</p>
        </div>
      ) : (
        <section className="py-20 bg-gray-50">
          <div className="w-[90vw] mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Latest Articles
              </h2>
              <p className="text-gray-600">
                Explore our recent healthcare insights and updates
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((post, index) => (
                <motion.article
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
                >
                  <div className="relative overflow-hidden">
                    {post.featuredImage ? (
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-r from-teal-400 to-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <span className="text-white text-4xl font-bold">
                          {post.title.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm text-teal-600 px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                        <Tag size={12} />
                        <span>{post.category}</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{formatDate(post.publishedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{post.readingTime} min read</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors duration-300">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
                      {post.excerpt || post.content.substring(0, 150) + "..."}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] rounded-full flex items-center justify-center">
                          <User size={14} className="text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {post.authorName || post.author?.name}
                        </span>
                      </div>

                      <div className="text-teal-600 font-medium text-sm hover:text-teal-700 flex items-center space-x-1 group-hover:translate-x-1 transition-transform duration-300">
                        <span>Read More</span>
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-4">
                <button
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                    window.scrollTo({ top: 400, behavior: "smooth" });
                  }}
                  disabled={currentPage === 1}
                  className="p-3 rounded-full bg-white shadow-md text-teal-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-50 transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 400, behavior: "smooth" });
                          }}
                          className={`w-12 h-12 rounded-full font-bold transition-all duration-300 ${
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white shadow-lg scale-110"
                              : "bg-white text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return (
                        <span key={pageNum} className="text-gray-400 font-bold">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                    window.scrollTo({ top: 400, behavior: "smooth" });
                  }}
                  disabled={currentPage === totalPages}
                  className="p-3 rounded-full bg-white shadow-md text-teal-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-50 transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6]">
        <div className="w-[90vw] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-xl text-teal-100 mb-8">
              Get the latest healthcare insights, research updates, and expert
              tips delivered to your inbox.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="bg-white text-teal-600 px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
