import { useState, useEffect, useRef } from "react";
import { blogAPI } from "../../services/api";
import { toast } from "react-toastify";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Undo, 
  Redo, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Code, 
  List, 
  ListOrdered, 
  Quote, 
  Minus, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  Link2, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  ArrowLeft,
  CheckCircle,
  XCircle
} from "lucide-react";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: {
    _id: string;
    name: string;
    email: string;
  };
  authorName: string;
  featuredImage: string;
  featuredImageAlt?: string;
  status: "draft" | "published" | "archived";
  isActive: boolean;
  isFeatured: boolean;
  views: number;
  likes: number;
  readingTime: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
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
}

const CATEGORIES = [
  "Healthcare",
  "Research",
  "Training",
  "Technology",
  "News",
  "Tips & Advice",
  "Case Studies",
  "Industry Updates",
  "Other",
];

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [customLimit, setCustomLimit] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    category: "Healthcare",
    tags: "",
    featuredImage: "",
    featuredImageAlt: "",
    status: "draft" as "draft" | "published" | "archived",
    isFeatured: false,
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    focusKeyword: "",
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    noIndex: false,
    author: "Admin",
    faq: [] as { question: string; answer: string }[],
    schemaMarkup: {
      articleSchema: true,
      faqPageSchema: false,
      breadcrumbSchema: true,
    },
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Editor and tags state
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'html' | 'preview'>('editor');
  const [newTag, setNewTag] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Update debounced search term
  useEffect(() => {
    if (searchTerm === debouncedSearch) return;
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch]);

  // Reset page to 1 when search or filter states change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterStatus, filterCategory]);

  // Main fetch hook (triggers once per batched state change)
  useEffect(() => {
    fetchBlogs();
  }, [currentPage, limit, filterStatus, filterCategory, debouncedSearch]);

  // Sync content state to contentEditable div
  useEffect(() => {
    if (showModal && activeTab === "editor" && editorRef.current) {
      if (editorRef.current.innerHTML !== formData.content) {
        editorRef.current.innerHTML = formData.content;
      }
    }
  }, [activeTab, showModal]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit,
        status: filterStatus === "all" ? "" : filterStatus,
        category: filterCategory === "all" ? "" : filterCategory,
        search: debouncedSearch,
      };
      const response = await blogAPI.adminGetAllBlogs(params);
      if (response.data.success) {
        setBlogs(response.data.data);
        setTotalPages(response.data.totalPages || 1);
        setTotalBlogs(response.data.totalBlogs || response.data.data.length);
      }
    } catch (error: any) {
      console.error("Error fetching blogs:", error);
      toast.error(error.response?.data?.message || "Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Auto-generate slug from title
    if (name === "title" && !editingBlog) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    try {
      setUploadingImage(true);
      const response = await blogAPI.uploadImage(imageFile);
      toast.success("Image uploaded successfully");
      return response.data.data.url;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.response?.data?.message || "Failed to upload image");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Word & Character count helpers
  const getWordCount = (html: string) => {
    const text = html.replace(/<[^>]*>/g, " ").trim();
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
  };

  const getCharCount = (html: string) => {
    const text = html.replace(/<[^>]*>/g, "").trim();
    return text.length;
  };

  // Live SEO Score calculation
  const calculateSEOScore = () => {
    let score = 0;
    const checks: { label: string; passed: boolean }[] = [];

    const title = formData.title;
    const slug = formData.slug;
    const content = formData.content;
    const focusKeyword = formData.focusKeyword.toLowerCase().trim();
    const metaTitle = formData.metaTitle;
    const metaDescription = formData.metaDescription;

    if (focusKeyword) {
      score += 15;
      checks.push({ label: `Focus keyword is set`, passed: true });
    } else {
      checks.push({ label: "Set a focus keyword", passed: false });
    }

    if (focusKeyword && title.toLowerCase().includes(focusKeyword)) {
      score += 15;
      checks.push({ label: "Focus keyword found in Title", passed: true });
    } else {
      checks.push({ label: "Focus keyword not found in Title", passed: false });
    }

    if (focusKeyword && metaDescription.toLowerCase().includes(focusKeyword)) {
      score += 15;
      checks.push({ label: "Focus keyword found in Meta Description", passed: true });
    } else {
      checks.push({ label: "Focus keyword not found in Meta Description", passed: false });
    }

    if (focusKeyword && slug.toLowerCase().includes(focusKeyword.replace(/\s+/g, '-'))) {
      score += 10;
      checks.push({ label: "Focus keyword found in URL/Slug", passed: true });
    } else {
      checks.push({ label: "Focus keyword not found in URL/Slug", passed: false });
    }

    const wordCount = getWordCount(content);
    if (wordCount >= 300) {
      score += 15;
      checks.push({ label: `Content has ${wordCount} words (Good length)`, passed: true });
    } else {
      checks.push({ label: `Content has ${wordCount} words (Minimum 300 recommended)`, passed: false });
    }

    if (metaTitle.length >= 30 && metaTitle.length <= 60) {
      score += 10;
      checks.push({ label: `Meta Title is of good length (${metaTitle.length} chars)`, passed: true });
    } else {
      checks.push({ label: "Meta Title should be between 30 and 60 characters", passed: false });
    }

    if (metaDescription.length >= 105 && metaDescription.length <= 160) {
      score += 10;
      checks.push({ label: `Meta Description is of good length (${metaDescription.length} chars)`, passed: true });
    } else {
      checks.push({ label: "Meta Description should be between 105 and 160 characters", passed: false });
    }

    if (formData.featuredImage) {
      if (formData.featuredImageAlt.trim()) {
        score += 10;
        checks.push({ label: "Featured Image Alt text is set", passed: true });
      } else {
        checks.push({ label: "Add Alt text to your featured image", passed: false });
      }
    } else {
      score += 10;
    }

    return { score, checks };
  };

  // Editor Command execution helper
  const executeCommand = (e: React.MouseEvent, command: string, arg: string = "") => {
    e.preventDefault();
    document.execCommand(command, false, arg);
    handleEditorInput();
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setFormData((prev) => ({ ...prev, content: html }));
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (submitting) return; // Prevent double submission

    try {
      setSubmitting(true);
      let featuredImageUrl = formData.featuredImage;

      // Upload image if new file selected
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          featuredImageUrl = uploadedUrl;
        } else {
          setSubmitting(false);
          return; // Stop if image upload failed
        }
      }

      const blogData = {
        ...formData,
        featuredImage: featuredImageUrl,
        authorName: formData.author,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        metaKeywords: formData.metaKeywords
          .split(",")
          .map((kw) => kw.trim())
          .filter((kw) => kw),
      };

      if (editingBlog) {
        await blogAPI.updateBlog(editingBlog._id, blogData);
        toast.success("Blog updated successfully! 🎉");
      } else {
        await blogAPI.createBlog(blogData);
        toast.success("Blog created successfully! 🎉");
      }

      setShowModal(false);
      resetForm();
      fetchBlogs();
    } catch (error: any) {
      console.error("Error saving blog:", error);
      toast.error(error.response?.data?.message || "Failed to save blog");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || "",
      slug: blog.slug || "",
      content: blog.content || "",
      excerpt: blog.excerpt || "",
      category: blog.category || "Healthcare",
      tags: blog.tags ? blog.tags.join(", ") : "",
      featuredImage: blog.featuredImage || "",
      featuredImageAlt: blog.featuredImageAlt || "",
      status: blog.status || "draft",
      isFeatured: blog.isFeatured || false,
      metaTitle: blog.metaTitle || "",
      metaDescription: blog.metaDescription || "",
      metaKeywords: blog.metaKeywords ? blog.metaKeywords.join(", ") : "",
      focusKeyword: blog.focusKeyword || "",
      canonicalUrl: blog.canonicalUrl || "",
      ogTitle: blog.ogTitle || "",
      ogDescription: blog.ogDescription || "",
      noIndex: blog.noIndex || false,
      author: blog.authorName || "Admin",
      faq: blog.faq || [],
      schemaMarkup: blog.schemaMarkup || {
        articleSchema: true,
        faqPageSchema: false,
        breadcrumbSchema: true,
      },
    });
    setImagePreview(blog.featuredImage || "");
    setImageFile(null);
    setShowModal(true);
    setActiveTab("editor");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    try {
      await blogAPI.deleteBlog(id);
      toast.success("Blog deleted successfully");
      fetchBlogs();
    } catch (error: any) {
      console.error("Error deleting blog:", error);
      toast.error(error.response?.data?.message || "Failed to delete blog");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await blogAPI.toggleBlogStatus(id);
      toast.success("Blog status updated successfully");
      fetchBlogs();
    } catch (error: any) {
      console.error("Error toggling status:", error);
      toast.error(error.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await blogAPI.toggleFeaturedStatus(id);
      toast.success("Featured status updated successfully");
      fetchBlogs();
    } catch (error: any) {
      console.error("Error toggling featured:", error);
      toast.error(
        error.response?.data?.message || "Failed to toggle featured status",
      );
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      category: "Healthcare",
      tags: "",
      featuredImage: "",
      featuredImageAlt: "",
      status: "draft",
      isFeatured: false,
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      focusKeyword: "",
      canonicalUrl: "",
      ogTitle: "",
      ogDescription: "",
      noIndex: false,
      author: "Admin",
      faq: [],
      schemaMarkup: {
        articleSchema: true,
        faqPageSchema: false,
        breadcrumbSchema: true,
      },
    });
    setEditingBlog(null);
    setImageFile(null);
    setImagePreview("");
  };

  const filteredBlogs = blogs.filter((blog) => {
    if (filterStatus !== "all" && blog.status !== filterStatus) return false;
    if (filterCategory !== "all" && blog.category !== filterCategory)
      return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="p-6">
      {!showModal ? (
        <>
          <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create New Blog
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex justify-between items-center gap-4">
        <div className="flex gap-4">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded px-3 py-2"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64"
          />
        </div>
      </div>

      {/* Blogs Table */}
      <div className="bg-white rounded-lg shadow ">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Views
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBlogs.map((blog) => (
              <tr key={blog._id}>
                <td className="px-6 py-4">
                  {blog.featuredImage ? (
                    <img
                      src={blog.featuredImage}
                      alt={blog.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {blog.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {blog.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {blog.category}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {blog.authorName || blog.author?.name}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      blog.status === "published"
                        ? "bg-green-100 text-green-800"
                        : blog.status === "draft"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {blog.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {blog.views}
                </td>
                <td className="px-6 py-4 text-sm relative">
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === blog._id ? null : blog._id,
                      )
                    }
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>

                  {openDropdown === blog._id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenDropdown(null)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              handleEdit(blog);
                              setOpenDropdown(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => {
                              handleToggleStatus(blog._id);
                              setOpenDropdown(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {blog.status === "published"
                              ? "📝 Unpublish"
                              : "✅ Publish"}
                          </button>
                          <button
                            onClick={() => {
                              handleToggleFeatured(blog._id);
                              setOpenDropdown(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {blog.isFeatured ? "⭐ Unfeature" : "⭐ Feature"}
                          </button>
                          <hr className="my-1" />
                          <button
                            onClick={() => {
                              handleDelete(blog._id);
                              setOpenDropdown(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!loading && totalBlogs > 0 && (
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-md gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Custom"
                value={customLimit}
                onChange={(e) => setCustomLimit(e.target.value)}
                onBlur={() => {
                  if (customLimit && Number(customLimit) > 0) {
                    setLimit(Number(customLimit));
                    setCurrentPage(1);
                  }
                }}
                className="w-20 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <span className="text-sm text-gray-500">
              Showing {Math.min((currentPage - 1) * limit + 1, totalBlogs)} to{" "}
              {Math.min(currentPage * limit, totalBlogs)} of {totalBlogs} blogs
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>

            <div className="flex items-center gap-1">
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
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200"
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
                    <span key={pageNum} className="px-1 text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      )}
        </>
      ) : (() => {
        const { score, checks } = calculateSEOScore();
        return (
          <div className="bg-[#f8fafc] text-slate-700 animate-fadeInUp">
            <div className="max-w-7xl mx-auto">
              {/* Top bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-semibold text-sm w-fit"
                >
                  <ArrowLeft size={18} />
                  <span>Back to Blogs</span>
                </button>
                
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="border border-slate-300 bg-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-shadow"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                  
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={submitting || uploadingImage}
                    className="bg-[#f59e0b] hover:bg-amber-600 text-white font-bold px-5 py-2 rounded-lg focus:ring-4 focus:ring-amber-200 transition-all flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingBlog ? "Update Blog" : "Create Blog"}</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column (Main Editor content) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Title & Slug */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Blog Title..."
                      required
                      className="w-full text-3xl font-extrabold text-slate-800 placeholder-slate-300 border-none outline-none focus:ring-0 p-0 mb-3"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-100 pt-3">
                      <span className="text-slate-400">
                        Slug: <span className="font-mono text-amber-600 font-semibold">{formData.slug || 'auto-generated-slug'}</span>
                      </span>
                      <span className="text-slate-400 font-semibold">
                        {Math.ceil(getWordCount(formData.content) / 200) || 1} min read
                      </span>
                    </div>
                  </div>

                  {/* Rich Text Editor */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-150 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-150 bg-slate-50/50 px-4">
                      {/* Tabs */}
                      <div className="flex gap-2">
                        {(['editor', 'html', 'preview'] as const).map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`py-3 px-4 font-bold text-sm border-b-2 capitalize transition-colors ${
                              activeTab === tab
                                ? 'border-[#f59e0b] text-[#f59e0b]'
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                      {/* Counters */}
                      <span className="text-xs text-slate-400 font-medium">
                        {getWordCount(formData.content)} words - {getCharCount(formData.content)} chars
                      </span>
                    </div>

                    {/* Toolbar */}
                    {activeTab === 'editor' && (
                      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-150 text-slate-600">
                        <button type="button" onClick={(e) => executeCommand(e, 'undo')} title="Undo" className="p-1.5 hover:bg-slate-200 rounded transition-colors"><Undo size={15} /></button>
                        <button type="button" onClick={(e) => executeCommand(e, 'redo')} title="Redo" className="p-1.5 hover:bg-slate-200 rounded transition-colors"><Redo size={15} /></button>
                        <div className="h-4 w-px bg-slate-200 mx-1"></div>
                        
                        <button type="button" onClick={(e) => executeCommand(e, 'formatBlock', '<h1>')} title="Heading 1" className="p-1.5 hover:bg-slate-200 rounded font-bold text-xs transition-colors">H1</button>
                        <button type="button" onClick={(e) => executeCommand(e, 'formatBlock', '<h2>')} title="Heading 2" className="p-1.5 hover:bg-slate-200 rounded font-bold text-xs transition-colors">H2</button>
                        <button type="button" onClick={(e) => executeCommand(e, 'formatBlock', '<h3>')} title="Heading 3" className="p-1.5 hover:bg-slate-200 rounded font-bold text-xs transition-colors">H3</button>
                        <div className="h-4 w-px bg-slate-200 mx-1"></div>

                        <button type="button" onClick={(e) => executeCommand(e, 'bold')} title="Bold" className="p-1.5 hover:bg-slate-200 rounded transition-colors"><Bold size={15} /></button>
                        <button type="button" onClick={(e) => executeCommand(e, 'italic')} title="Italic" className="p-1.5 hover:bg-slate-200 rounded transition-colors"><Italic size={15} /></button>
                        <button type="button" onClick={(e) => executeCommand(e, 'underline')} title="Underline" className="p-1.5 hover:bg-slate-200 rounded transition-colors"><Underline size={15} /></button>
                        <button type="button" onClick={(e) => executeCommand(e, 'strikeThrough')} title="Strikethrough" className="p-1.5 hover:bg-slate-200 rounded transition-colors"><Strikethrough size={15} /></button>
                        <button type="button" onClick={(e) => executeCommand(e, 'formatBlock', '<pre>')} title="Code Block" className="p-1.5 hover:bg-slate-200 rounded transition-colors"><Code size={15} /></button>
                        <div className="h-4 w-px bg-slate-200 mx-1"></div>

                        <button type="button" onClick={(e) => executeCommand(e, 'insertUnorderedList')} title="Bullet List" className="p-1.5 hover:bg-slate-200 rounded transition-colors"><List size={15} /></button>
                        <button type="button" onClick={(e) => executeCommand(e, 'insertOrderedList')} title="Numbered List" className="p-1.5 hover:bg-slate-200 rounded transition-colors"><ListOrdered size={15} /></button>
                        <button type="button" onClick={(e) => executeCommand(e, 'formatBlock', 'blockquote')} title="Quote" className="p-1.5 hover:bg-slate-200 rounded transition-colors"><Quote size={15} /></button>
                        <button type="button" onClick={(e) => executeCommand(e, 'insertHorizontalRule')} title="Divider" className="p-1.5 hover:bg-slate-200 rounded transition-colors"><Minus size={15} /></button>
                        <div className="h-4 w-px bg-slate-200 mx-1"></div>

                        <button type="button" onClick={(e) => executeCommand(e, 'justifyLeft')} title="Align Left" className="p-1.5 hover:bg-slate-200 rounded transition-colors"><AlignLeft size={15} /></button>
                        <button type="button" onClick={(e) => executeCommand(e, 'justifyCenter')} title="Align Center" className="p-1.5 hover:bg-slate-200 rounded transition-colors"><AlignCenter size={15} /></button>
                        <button type="button" onClick={(e) => executeCommand(e, 'justifyRight')} title="Align Right" className="p-1.5 hover:bg-slate-200 rounded transition-colors"><AlignRight size={15} /></button>
                        <button type="button" onClick={(e) => executeCommand(e, 'justifyFull')} title="Justify" className="p-1.5 hover:bg-slate-200 rounded transition-colors"><AlignJustify size={15} /></button>
                        <div className="h-4 w-px bg-slate-200 mx-1"></div>

                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.preventDefault();
                            const url = prompt("Enter Link URL:");
                            if (url) document.execCommand('createLink', false, url);
                            handleEditorInput();
                          }} 
                          title="Insert Link" 
                          className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                        >
                          <Link2 size={15} />
                        </button>
                        
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.preventDefault();
                            const url = prompt("Enter Image URL:");
                            if (url) document.execCommand('insertImage', false, url);
                            handleEditorInput();
                          }} 
                          title="Insert Image Link" 
                          className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                        >
                          <ImageIcon size={15} />
                        </button>

                        <button type="button" onClick={(e) => executeCommand(e, 'removeFormat')} title="Clear Formatting" className="p-1.5 hover:bg-slate-200 rounded font-semibold text-xs transition-colors">Tx</button>
                      </div>
                    )}

                    {/* Editor Workspace */}
                    <div className="p-1 bg-white">
                      {activeTab === 'editor' && (
                        <div
                          ref={editorRef}
                          contentEditable
                          onInput={handleEditorInput}
                          onBlur={handleEditorInput}
                          className="w-full min-h-[400px] p-6 focus:outline-none overflow-y-auto prose max-w-none text-slate-800 leading-relaxed [&_a]:text-orange-500 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:my-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:my-2 [&_p]:my-2 [&_blockquote]:border-l-4 [&_blockquote]:border-orange-500 [&_blockquote]:pl-4 [&_blockquote]:italic"
                          style={{ minHeight: '400px' }}
                        />
                      )}

                      {activeTab === 'html' && (
                        <textarea
                          name="content"
                          value={formData.content}
                          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                          className="w-full min-h-[400px] font-mono text-sm p-4 bg-slate-900 text-slate-100 focus:outline-none border-none resize-y rounded-b"
                          rows={18}
                        />
                      )}

                      {activeTab === 'preview' && (
                        <div 
                          className="w-full min-h-[400px] p-6 prose max-w-none bg-white text-slate-800 leading-relaxed overflow-y-auto [&_a]:text-orange-500 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-bold [&_blockquote]:border-l-4 [&_blockquote]:border-orange-500 [&_blockquote]:pl-4 [&_blockquote]:italic"
                          dangerouslySetInnerHTML={{ 
                            __html: formData.content 
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Short Description */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-700 mb-3 text-sm">Short Description (shown in blog cards)</h3>
                    <textarea
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Brief summary..."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      maxLength={500}
                    />
                  </div>

                  {/* FAQ Section */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-700 text-sm">FAQ Section</h3>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          faq: [...prev.faq, { question: '', answer: '' }]
                        }))}
                        className="flex items-center gap-1 bg-amber-50 text-[#f59e0b] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors"
                      >
                        <Plus size={14} />
                        <span>Add FAQ</span>
                      </button>
                    </div>

                    {formData.faq.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        No FAQs added yet. Click "+ Add FAQ" to include FAQs.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {formData.faq.map((item, index) => (
                          <div key={index} className="relative p-4 bg-slate-50/50 rounded-xl border border-slate-200 space-y-3">
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                faq: prev.faq.filter((_, idx) => idx !== index)
                              }))}
                              className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                            <div className="pr-8">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">FAQ {index + 1}</span>
                              <input
                                type="text"
                                placeholder="Question..."
                                value={item.question}
                                onChange={(e) => {
                                  const updatedFaq = [...formData.faq];
                                  updatedFaq[index].question = e.target.value;
                                  setFormData(prev => ({ ...prev, faq: updatedFaq }));
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                            <div>
                              <textarea
                                placeholder="Answer..."
                                rows={2}
                                value={item.answer}
                                onChange={(e) => {
                                  const updatedFaq = [...formData.faq];
                                  updatedFaq[index].answer = e.target.value;
                                  setFormData(prev => ({ ...prev, faq: updatedFaq }));
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column (Sidebar Settings) */}
                <div className="space-y-6">
                  
                  {/* SEO Score */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-700 mb-4 text-sm">SEO Score</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center font-extrabold text-lg border-4 ${
                        score >= 80 ? 'text-green-600 border-green-500 bg-green-50' :
                        score >= 50 ? 'text-orange-500 border-orange-400 bg-orange-50' :
                        'text-red-600 border-red-500 bg-red-50'
                      }`}>
                        {score}/100
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              score >= 80 ? 'bg-green-500' :
                              score >= 50 ? 'bg-orange-400' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 block mt-1 font-semibold">
                          {score >= 80 ? 'Good optimization!' : score >= 50 ? 'Needs slight improvements.' : 'Critical changes recommended.'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-slate-100 pt-4 max-h-[220px] overflow-y-auto pr-1">
                      {checks.map((check, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs">
                          {check.passed ? (
                            <CheckCircle size={15} className="text-green-500 mt-0.5 shrink-0" />
                          ) : (
                            <XCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
                          )}
                          <span className={check.passed ? 'text-slate-600' : 'text-slate-400'}>{check.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Post Settings */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                    <h3 className="font-bold text-slate-700 text-sm border-b border-slate-100 pb-2">Post Settings</h3>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Author</label>
                      <input
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleInputChange}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Tags</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newTag.trim()) {
                                const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
                                if (!currentTags.includes(newTag.trim())) {
                                  setFormData(prev => ({
                                    ...prev,
                                    tags: [...currentTags, newTag.trim()].join(', ')
                                  }));
                                }
                                setNewTag("");
                              }
                            }
                          }}
                          placeholder="Add tag..."
                          className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newTag.trim()) {
                              const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
                              if (!currentTags.includes(newTag.trim())) {
                                setFormData(prev => ({
                                  ...prev,
                                  tags: [...currentTags, newTag.trim()].join(', ')
                                }));
                              }
                              setNewTag("");
                            }
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      
                      {formData.tags && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {formData.tags.split(',').map(tag => tag.trim()).filter(Boolean).map((tag, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[11px] flex items-center gap-1 border border-slate-150 font-medium">
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const remaining = formData.tags
                                    .split(',')
                                    .map(t => t.trim())
                                    .filter(t => t !== tag);
                                  setFormData(prev => ({ ...prev, tags: remaining.join(', ') }));
                                }}
                                className="hover:text-red-500 font-bold ml-0.5"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Featured Image */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                    <h3 className="font-bold text-slate-700 text-sm border-b border-slate-100 pb-2">Featured Image</h3>
                    
                    <div 
                      onClick={() => {
                        const fileInput = document.getElementById('featured-image-file') as HTMLInputElement;
                        if (fileInput) fileInput.click();
                      }}
                      className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors flex flex-col items-center justify-center relative min-h-[140px] overflow-hidden group"
                    >
                      <input
                        type="file"
                        id="featured-image-file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      {imagePreview ? (
                        <>
                          <img
                            src={imagePreview}
                            alt="Featured Preview"
                            className="absolute inset-0 w-full h-full object-cover rounded-xl"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                            Change Image
                          </div>
                        </>
                      ) : (
                        <>
                          <ImageIcon size={30} className="text-slate-300 mb-2" />
                          <span className="text-xs text-slate-400 font-semibold">Click to upload</span>
                        </>
                      )}
                    </div>

                    {uploadingImage && (
                      <div className="text-xs text-[#f59e0b] font-semibold animate-pulse text-center">Uploading image...</div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Alt Text</label>
                      <input
                        type="text"
                        name="featuredImageAlt"
                        value={formData.featuredImageAlt}
                        onChange={handleInputChange}
                        placeholder="Describe the image..."
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* SEO Settings */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                    <h3 className="font-bold text-slate-700 text-sm border-b border-slate-100 pb-2">SEO Settings</h3>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Focus Keyword</label>
                      <input
                        type="text"
                        name="focusKeyword"
                        value={formData.focusKeyword}
                        onChange={handleInputChange}
                        placeholder="e.g. venue booking tips"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-500">Meta Title</label>
                        <span className={`text-[10px] font-mono ${formData.metaTitle.length > 60 ? 'text-red-500' : 'text-slate-400'}`}>
                          ({formData.metaTitle.length}/60)
                        </span>
                      </div>
                      <input
                        type="text"
                        name="metaTitle"
                        value={formData.metaTitle}
                        onChange={handleInputChange}
                        maxLength={60}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-500">Meta Description</label>
                        <span className={`text-[10px] font-mono ${formData.metaDescription.length > 160 ? 'text-red-500' : 'text-slate-400'}`}>
                          ({formData.metaDescription.length}/160)
                        </span>
                      </div>
                      <textarea
                        name="metaDescription"
                        value={formData.metaDescription}
                        onChange={handleInputChange}
                        rows={2}
                        maxLength={160}
                        placeholder="Meta description..."
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Canonical URL</label>
                      <input
                        type="text"
                        name="canonicalUrl"
                        value={formData.canonicalUrl}
                        onChange={handleInputChange}
                        placeholder="https://..."
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    {/* Google Preview */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Google Preview</span>
                      <div className="space-y-1 font-sans">
                        <div className="text-blue-700 hover:underline font-semibold text-base leading-tight break-words">
                          {formData.metaTitle || formData.title || 'Blog Title'}
                        </div>
                        <div className="text-green-800 text-xs truncate">
                          rentalmeet.com/blog/{formData.slug || 'slug'}
                        </div>
                        <div className="text-slate-600 text-xs line-clamp-2 leading-relaxed break-words">
                          {formData.metaDescription || formData.excerpt || 'Meta description...'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">OG Title</label>
                      <input
                        type="text"
                        name="ogTitle"
                        value={formData.ogTitle}
                        onChange={handleInputChange}
                        placeholder="Social Share Title..."
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">OG Description</label>
                      <textarea
                        name="ogDescription"
                        value={formData.ogDescription}
                        onChange={handleInputChange}
                        rows={2}
                        placeholder="Social Share Description..."
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="noIndex"
                        name="noIndex"
                        checked={formData.noIndex}
                        onChange={(e) => setFormData(prev => ({ ...prev, noIndex: e.target.checked }))}
                        className="w-4 h-4 text-orange-500 focus:ring-orange-400 border-slate-300 rounded"
                      />
                      <label htmlFor="noIndex" className="text-xs font-bold text-slate-600 select-none">
                        No Index (hide from search engines)
                      </label>
                    </div>
                  </div>

                  {/* Schema Markup */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                    <h3 className="font-bold text-slate-700 text-sm border-b border-slate-100 pb-2">Schema Markup</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Article Schema</span>
                        <span className="text-[10px] text-slate-400">Default schema for articles</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.schemaMarkup.articleSchema}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            schemaMarkup: { ...prev.schemaMarkup, articleSchema: e.target.checked }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">FAQ Page Schema</span>
                        <span className="text-[10px] text-slate-400">Generated if FAQs are defined</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.schemaMarkup.faqPageSchema}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            schemaMarkup: { ...prev.schemaMarkup, faqPageSchema: e.target.checked }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Breadcrumb Schema</span>
                        <span className="text-[10px] text-slate-400">Navigation breadcrumbs schema</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.schemaMarkup.breadcrumbSchema}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            schemaMarkup: { ...prev.schemaMarkup, breadcrumbSchema: e.target.checked }
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
