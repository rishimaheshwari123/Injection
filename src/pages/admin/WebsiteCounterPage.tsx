import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { 
  Eye, 
  Users, 
  Building2, 
  UserCheck, 
  Globe, 
  Search, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert 
} from "lucide-react";
import { dashboardAPI } from "../../services/api";

interface VisitLog {
  _id: string;
  role: "user" | "vendor" | "ambassador" | "guest" | "admin";
  ipAddress: string;
  userId?: string;
  name?: string;
  email?: string;
  count: number;
  lastVisited: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface RoleStats {
  visits: number;
  unique: number;
}

interface Stats {
  user: RoleStats;
  vendor: RoleStats;
  ambassador: RoleStats;
  guest: RoleStats;
  admin: RoleStats;
}

export default function WebsiteCounterPage() {
  const [logs, setLogs] = useState<VisitLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  });
  const [stats, setStats] = useState<Stats>({
    user: { visits: 0, unique: 0 },
    vendor: { visits: 0, unique: 0 },
    ambassador: { visits: 0, unique: 0 },
    guest: { visits: 0, unique: 0 },
    admin: { visits: 0, unique: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("lastVisited");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    fetchLogs();
  }, [roleFilter, sortBy, sortOrder, currentPage, pageSize]);

  // Debounced search trigger (fetches when user stops typing)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (currentPage === 1) {
        fetchLogs();
      } else {
        setCurrentPage(1); // will trigger fetch logs
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await dashboardAPI.getVisitorLogs({
        role: roleFilter,
        search: searchQuery,
        page: currentPage,
        limit: pageSize,
        sortBy,
        sortOrder,
      });

      if (response.data.success) {
        setLogs(response.data.data.logs);
        setPagination(response.data.data.pagination);
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error("Error fetching visitor logs:", error);
      toast.error("Failed to load website counter logs");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  // Compute overall summary stats
  const totalVisits = Object.values(stats).reduce((acc, curr) => acc + curr.visits, 0);
  const uniqueRegisteredUsers = stats.user.unique;
  const uniqueVendors = stats.vendor.unique;
  const uniqueAmbassadors = stats.ambassador.unique;
  const uniqueGuests = stats.guest.unique;

  const roleBadges: Record<string, string> = {
    admin: "bg-red-50 text-red-700 border-red-200",
    user: "bg-blue-50 text-blue-700 border-blue-200",
    vendor: "bg-purple-50 text-purple-700 border-purple-200",
    ambassador: "bg-orange-50 text-orange-700 border-orange-200",
    guest: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Website Counter</h1>
        <p className="text-gray-600 mt-1">
          Monitor page views, user engagement, guest visits, and track client interactions in real-time.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mb-8">
        {/* Total Views Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Eye size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Visits</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalVisits.toLocaleString()}</h3>
          </div>
        </div>

        {/* Unique Users Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Unique Users</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{uniqueRegisteredUsers.toLocaleString()}</h3>
          </div>
        </div>

        {/* Unique Vendors Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Unique Vendors</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{uniqueVendors.toLocaleString()}</h3>
          </div>
        </div>

        {/* Unique Ambassadors Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center space-x-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Unique Ambassadors</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{uniqueAmbassadors.toLocaleString()}</h3>
          </div>
        </div>

        {/* Unique Guests Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center space-x-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <Globe size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Unique Guests</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{uniqueGuests.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Main Filter & Content Section */}
      <div className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden">
        {/* Controls Bar */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gray-50/55">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#3DB9A6] focus:border-[#3DB9A6]"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Role filter */}
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-lg text-sm bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3DB9A6]"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="vendor">Vendors</option>
              <option value="ambassador">Ambassadors</option>
              <option value="guest">Guests</option>
              <option value="admin">Admins</option>
            </select>

            {/* Page Size Selection */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-lg text-sm bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3DB9A6]"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading && logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3DB9A6] mb-3"></div>
              <p className="text-gray-500 text-sm">Fetching counter log entries...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShieldAlert className="text-gray-300 mb-3" size={48} />
              <p className="text-gray-600 font-medium">No visitor logs found</p>
              <p className="text-gray-400 text-xs mt-1">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/75">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Visitor Details
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("count")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Visit Count</span>
                      <ArrowUpDown size={14} className="text-gray-400" />
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("lastVisited")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Last Visited</span>
                      <ArrowUpDown size={14} className="text-gray-400" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-150">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/40 transition-colors">
                    {/* Visitor Details */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.role === "guest" ? (
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">Anonymous Guest</div>
                          <div className="text-gray-400 text-xs">Guest Visitor</div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">{log.name || "N/A"}</div>
                          <div className="text-gray-500 text-xs">{log.email || "N/A"}</div>
                        </div>
                      )}
                    </td>

                    {/* Role Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${roleBadges[log.role] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                        {log.role.toUpperCase()}
                      </span>
                    </td>

                    {/* IP Address */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                      {log.ipAddress}
                    </td>

                    {/* Visit Count */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-md text-sm font-bold bg-[#3DB9A6]/10 text-[#3DB9A6]">
                        {log.count}
                      </span>
                    </td>

                    {/* Last Visited Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.lastVisited).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 bg-gray-50/55 border-t border-gray-100 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Showing page <span className="font-semibold text-gray-800">{pagination.page}</span> of <span className="font-semibold text-gray-800">{pagination.pages}</span> ({pagination.total} records total)
            </div>
            
            <div className="flex items-center space-x-1.5">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-1.5 border border-gray-300 rounded bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => {
                // Render simple sliding range for pages if there are many, else render all
                if (
                  p === 1 ||
                  p === pagination.pages ||
                  Math.abs(p - currentPage) <= 1
                ) {
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      disabled={loading}
                      className={`px-3 py-1 text-xs border rounded transition-colors ${currentPage === p
                        ? "bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] border-transparent text-white font-semibold"
                        : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                      {p}
                    </button>
                  );
                } else if (p === 2 || p === pagination.pages - 1) {
                  return <span key={p} className="px-1 text-gray-400 text-xs">...</span>;
                }
                return null;
              })}

              <button
                disabled={currentPage === pagination.pages || loading}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-1.5 border border-gray-300 rounded bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
