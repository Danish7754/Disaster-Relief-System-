import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import * as adminService from "../../services/adminService";

// Icons
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM9 12a6 6 0 11-12 0 6 6 0 0112 0zM16 12a1 1 0 100 2h4a1 1 0 100-2h-4zM16 8a1 1 0 110-2h4a1 1 0 110 2h-4zM16 16a1 1 0 100 2h4a1 1 0 100-2h-4z"/>
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
  </svg>
);

const FileIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M4 4a2 2 0 012-2h6a1 1 0 01.707.293l6 6a1 1 0 01.293.707v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm2 2v12h12V10h-4a2 2 0 01-2-2V6H6z"/>
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"/>
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
  </svg>
);

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [govtUsers, setGovtUsers] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({ name: "", state: "", email: "", password: "" });
  const [formLoading, setFormLoading] = useState(false);

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [g, c, n, r] = await Promise.all([
        adminService.getGovernmentUsers(),
        adminService.getAllUsers(),
        adminService.getAllNgos(),
        adminService.getAllReports(),
      ]);
      setGovtUsers(g.users || []);
      setCitizens(c.users || []);
      setNgos(n.ngos || []);
      setReports(r.reports || []);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGovtUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    setFormLoading(true);
    try {
      await adminService.createGovtUser(formData);
      setSuccess("✓ Government user created successfully");
      setFormData({ name: "", state: "", email: "", password: "" });
      const updated = await adminService.getGovernmentUsers();
      setGovtUsers(updated.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setFormLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: DashboardIcon },
    { id: "create", label: "Create Govt User", icon: PlusIcon },
    { id: "govt", label: "Government Users", icon: BuildingIcon },
    { id: "users", label: "Citizens", icon: UsersIcon },
    { id: "ngos", label: "NGO Partners", icon: BuildingIcon },
    { id: "reports", label: "Disaster Reports", icon: FileIcon },
  ];

  const StatCard = ({ icon: Icon, label, value, color, lightBg }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-2">{label}</p>
          <p className="text-4xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${lightBg} ${color} p-3 rounded-xl`}>
          <Icon />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="flex h-screen">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-blue-600 text-white rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside className={`w-72 bg-white border-r border-gray-200 shadow-sm flex flex-col fixed lg:relative h-screen left-0 top-0 z-40 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}>
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-lg">
                🚨
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">DRS Admin</h2>
                <p className="text-xs text-blue-100">Control Panel</p>
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
                {user?.name?.charAt(0) || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                  }`}
                >
                  <Icon />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              <LogoutIcon />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto w-full lg:ml-0">
          <div className="p-4 sm:p-6 lg:p-8 mt-16 lg:mt-0">
            {/* Alert Messages */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium flex items-center gap-3 animate-slidedown">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-6 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 via-emerald-50 to-green-100 p-4 shadow-lg animate-successpop">
                <div className="flex items-start gap-3 text-green-900">
                  <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-green-600 text-white shadow-md animate-bounce">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-green-900">Created successfully</p>
                    <p className="mt-1 text-sm text-green-800">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Dashboard Section */}
            {activeSection === "dashboard" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
                  <p className="text-gray-600 text-sm sm:text-base">Welcome to your admin control panel</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <StatCard 
                    icon={BuildingIcon}
                    label="Government Users" 
                    value={govtUsers.length}
                    color="text-blue-600"
                    lightBg="bg-blue-100"
                  />
                  <StatCard 
                    icon={UsersIcon}
                    label="Citizens" 
                    value={citizens.length}
                    color="text-green-600"
                    lightBg="bg-green-100"
                  />
                  <StatCard 
                    icon={BuildingIcon}
                    label="NGO Partners" 
                    value={ngos.length}
                    color="text-purple-600"
                    lightBg="bg-purple-100"
                  />
                  <StatCard 
                    icon={FileIcon}
                    label="Disaster Reports" 
                    value={reports.length}
                    color="text-orange-600"
                    lightBg="bg-orange-100"
                  />
                </div>

                {/* Analytics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Report Status */}
                  <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Report Status Distribution</h3>
                    <div className="space-y-5">
                      {(() => {
                        const resolved = reports.filter(r => r.status === "resolved").length;
                        const inProgress = reports.filter(r => r.status === "in-progress").length;
                        const pending = reports.filter(r => r.status === "pending").length;
                        const total = reports.length || 1;
                        return (
                          <>
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold text-gray-700">Resolved</span>
                                <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">{resolved}</span>
                              </div>
                              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all" style={{width: `${(resolved/total)*100}%`}}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold text-gray-700">In Progress</span>
                                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{inProgress}</span>
                              </div>
                              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all" style={{width: `${(inProgress/total)*100}%`}}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold text-gray-700">Pending</span>
                                <span className="text-sm font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">{pending}</span>
                              </div>
                              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full transition-all" style={{width: `${(pending/total)*100}%`}}></div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">System Overview</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-5 bg-blue-50 rounded-xl border border-blue-100 hover:border-blue-200 transition-all">
                        <span className="text-sm font-semibold text-gray-700">Total Users</span>
                        <span className="text-3xl font-bold text-blue-600">{citizens.length + govtUsers.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-5 bg-purple-50 rounded-xl border border-purple-100 hover:border-purple-200 transition-all">
                        <span className="text-sm font-semibold text-gray-700">Active NGOs</span>
                        <span className="text-3xl font-bold text-purple-600">{ngos.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-5 bg-orange-50 rounded-xl border border-orange-100 hover:border-orange-200 transition-all">
                        <span className="text-sm font-semibold text-gray-700">Total Incidents</span>
                        <span className="text-3xl font-bold text-orange-600">{reports.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Create Government User Section */}
            {activeSection === "create" && (
              <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4">
                <div className="w-full max-w-2xl">
                  {/* Header */}
                  <div className="mb-12 text-center">
                    <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-3">Create Government User</h1>
                    <p className="text-base sm:text-lg text-gray-600 max-w-lg mx-auto">Add a new government official to the disaster relief system</p>
                  </div>

                  {/* Form Card */}
                  <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-xl border border-gray-100">
                    <form onSubmit={handleCreateGovtUser} className="space-y-8">
                      {/* Name Field */}
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                          </svg>
                          <span>Full Name</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white hover:border-gray-300 text-gray-900 font-medium"
                          placeholder="e.g., John Doe"
                        />
                      </div>

                      {/* State Field */}
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-indigo-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a2 2 0 119.999 0H5.05zm-1.414 1.414A4 4 0 003 8c0 1.99-.998 3.745-2.516 4.817A7.958 7.958 0 002 16a8 8 0 0016 0c0-1.993-.998-3.746-2.516-4.817A4 4 0 0015.05 5.05a2 2 0 01-1.414-3.636zm5.364 0a2 2 0 119.999 0 2 2 0 01-9.999 0zm1.414 1.414A4 4 0 0017 8v8a8 8 0 01-16 0c0-1.993.998-3.746 2.516-4.817A4 4 0 004.95 5.05a2 2 0 011.414-3.636z" clipRule="evenodd"/>
                          </svg>
                          <span>State/Region</span>
                        </label>
                        <select
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white hover:border-gray-300 appearance-none cursor-pointer text-gray-900 font-medium"
                        >
                          <option value="">Select your state...</option>
                          <option value="Andhra Pradesh">Andhra Pradesh</option>
                          <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                          <option value="Assam">Assam</option>
                          <option value="Bihar">Bihar</option>
                          <option value="Chhattisgarh">Chhattisgarh</option>
                          <option value="Goa">Goa</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Haryana">Haryana</option>
                          <option value="Himachal Pradesh">Himachal Pradesh</option>
                          <option value="Jharkhand">Jharkhand</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Kerala">Kerala</option>
                          <option value="Madhya Pradesh">Madhya Pradesh</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Manipur">Manipur</option>
                          <option value="Meghalaya">Meghalaya</option>
                          <option value="Mizoram">Mizoram</option>
                          <option value="Nagaland">Nagaland</option>
                          <option value="Odisha">Odisha</option>
                          <option value="Punjab">Punjab</option>
                          <option value="Rajasthan">Rajasthan</option>
                          <option value="Sikkim">Sikkim</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                          <option value="Telangana">Telangana</option>
                          <option value="Tripura">Tripura</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                          <option value="Uttarakhand">Uttarakhand</option>
                          <option value="West Bengal">West Bengal</option>
                        </select>
                      </div>

                      {/* Email Field */}
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                          </svg>
                          <span>Email Address</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white hover:border-gray-300 text-gray-900 font-medium"
                          placeholder="official@government.in"
                        />
                      </div>

                      {/* Password Field */}
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5 text-purple-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                          </svg>
                          <span>Password</span>
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white hover:border-gray-300 text-gray-900 font-medium"
                          placeholder="Enter a strong password"
                        />
                        <p className="text-xs text-gray-500 mt-3 ml-0">🔐 Minimum 8 characters recommended</p>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={formLoading}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg mt-10"
                      >
                        {formLoading ? (
                          <>
                            <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Creating Government User...
                          </>
                        ) : (
                          <>
                            <PlusIcon />
                            Create Government User
                          </>
                        )}
                      </button>

                      {/* Info Box */}
                      <div className="mt-10 p-5 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                        <p className="text-sm text-blue-900 font-medium leading-relaxed">ℹ️ This user will have government official access to the disaster relief system and will be responsible for disaster management in their assigned state.</p>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Government Users Section */}
            {activeSection === "govt" && (
              <div>
                <div className="mb-8">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Government Users</h1>
                  <p className="text-gray-600 text-sm sm:text-base">Manage government officials and administrators</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                  {loading ? (
                    <div className="p-8">
                      <div className="space-y-4">
                        {[1,2,3].map((i) => (
                          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                  ) : govtUsers.length === 0 ? (
                    <div className="p-12 text-center">
                      <p className="text-gray-500 text-lg">No government users yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Name</th>
                            <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Email</th>
                            <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Role</th>
                            <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {govtUsers.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50 transition">
                              <td className="px-4 sm:px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    {user.name?.charAt(0) || "U"}
                                  </div>
                                  <span className="font-semibold text-gray-900 text-sm">{user.name}</span>
                                </div>
                              </td>
                              <td className="hidden sm:table-cell px-6 py-4 text-gray-700 font-medium text-sm">{user.email}</td>
                              <td className="hidden md:table-cell px-6 py-4">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4">
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                  Active
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Citizens Section */}
            {activeSection === "users" && (
              <div>
                <div className="mb-8">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Citizens</h1>
                  <p className="text-gray-600 text-sm sm:text-base">View and manage all registered citizens</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                  {loading ? (
                    <div className="p-8">
                      <div className="space-y-4">
                        {[1,2,3].map((i) => (
                          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                  ) : citizens.length === 0 ? (
                    <div className="p-12 text-center">
                      <p className="text-gray-500 text-lg">No citizens registered yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Name</th>
                            <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Email</th>
                            <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Role</th>
                            <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {citizens.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50 transition">
                              <td className="px-4 sm:px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    {user.name?.charAt(0) || "U"}
                                  </div>
                                  <span className="font-semibold text-gray-900 text-sm">{user.name}</span>
                                </div>
                              </td>
                              <td className="hidden sm:table-cell px-6 py-4 text-gray-700 font-medium text-sm">{user.email}</td>
                              <td className="hidden md:table-cell px-6 py-4">
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4">
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                  Active
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* NGOs Section */}
            {activeSection === "ngos" && (
              <div>
                <div className="mb-8">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">NGO Partners</h1>
                  <p className="text-gray-600 text-sm sm:text-base">Manage disaster relief organizations</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                  {loading ? (
                    <div className="p-8">
                      <div className="space-y-4">
                        {[1,2,3].map((i) => (
                          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                  ) : ngos.length === 0 ? (
                    <div className="p-12 text-center">
                      <p className="text-gray-500 text-lg">No NGOs registered yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Name</th>
                            <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Category</th>
                            <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Rating</th>
                            <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {ngos.map((ngo) => (
                            <tr key={ngo._id} className="hover:bg-gray-50 transition">
                              <td className="px-4 sm:px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                    {ngo.name?.charAt(0) || "N"}
                                  </div>
                                  <span className="font-semibold text-gray-900 text-sm">{ngo.name}</span>
                                </div>
                              </td>
                              <td className="hidden sm:table-cell px-6 py-4 text-gray-700 font-medium text-sm">{ngo.category || "N/A"}</td>
                              <td className="hidden md:table-cell px-6 py-4">
                                <div className="flex items-center gap-1">
                                  <span className="text-yellow-500 text-lg">★</span>
                                  <span className="font-semibold text-gray-900 text-sm">{ngo.rating || "N/A"}</span>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4">
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                                  Active
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reports Section */}
            {activeSection === "reports" && (
              <div>
                <div className="mb-8">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Disaster Reports</h1>
                  <p className="text-gray-600 text-sm sm:text-base">Track all reported incidents and their status</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                  {loading ? (
                    <div className="p-8">
                      <div className="space-y-4">
                        {[1,2,3].map((i) => (
                          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                  ) : reports.length === 0 ? (
                    <div className="p-12 text-center">
                      <p className="text-gray-500 text-lg">No reports yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Title</th>
                            <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Status</th>
                            <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Priority</th>
                            <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Assigned NGO</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {reports.map((report) => (
                            <tr key={report._id} className="hover:bg-gray-50 transition">
                              <td className="px-4 sm:px-6 py-4">
                                <span className="font-semibold text-gray-900 line-clamp-1 sm:line-clamp-2 text-sm">{report.title}</span>
                              </td>
                              <td className="px-4 sm:px-6 py-4">
                                {report.status === "resolved" && (
                                  <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold whitespace-nowrap">
                                    ✓ Resolved
                                  </span>
                                )}
                                {report.status === "in-progress" && (
                                  <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold whitespace-nowrap">
                                    ⟳ In Progress
                                  </span>
                                )}
                                {report.status === "pending" && (
                                  <span className="px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold whitespace-nowrap">
                                    ○ Pending
                                  </span>
                                )}
                              </td>
                              <td className="hidden sm:table-cell px-6 py-4">
                                {report.priority === "critical" && (
                                  <span className="px-2 sm:px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold whitespace-nowrap">
                                    🔴 Critical
                                  </span>
                                )}
                                {report.priority === "high" && (
                                  <span className="px-2 sm:px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold whitespace-nowrap">
                                    🟠 High
                                  </span>
                                )}
                                {report.priority === "medium" && (
                                  <span className="px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold whitespace-nowrap">
                                    🟡 Medium
                                  </span>
                                )}
                                {report.priority === "low" && (
                                  <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold whitespace-nowrap">
                                    ⚪ Low
                                  </span>
                                )}
                              </td>
                              <td className="hidden md:table-cell px-6 py-4 text-gray-700 font-medium text-sm">
                                {report.assignedNgo?.name || "Unassigned"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`
        @keyframes slidedown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slidedown {
          animation: slidedown 0.3s ease-out;
        }
        @keyframes successpop {
          0% {
            opacity: 0;
            transform: translateY(-12px) scale(0.96);
          }
          70% {
            opacity: 1;
            transform: translateY(2px) scale(1.01);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-successpop {
          animation: successpop 0.45s ease-out;
        }
      `}</style>
    </div>
  );
}
