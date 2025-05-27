import {
  XCircle,
  Search,
  Clock,
  User,
  Plus,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import DashboardHeader from "./DashboardHeader";
import UserCard from "./UserCard";

function UsersAdminDashboard({ setDetailUser }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form state for adding new user
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "password",
  });

  const [formErrors, setFormErrors] = useState({});

  const DEBOUNCE_DELAY = 500;

  const debouncedSearch = useCallback(
    (value) => {
      const trimmedValue = value.trim();
      setSearchTerm(value);

      const handler = setTimeout(() => {
        setDebouncedSearchTerm(trimmedValue);
      }, DEBOUNCE_DELAY);
      return () => {
        clearTimeout(handler);
      };
    },
    [DEBOUNCE_DELAY]
  );

  useEffect(() => {
    if (debouncedSearchTerm === "") {
      setUsers(null);
    } else {
      fetchUsers(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  async function fetchUsers(value) {
    if (!value) {
      setUsers(null);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}admin/users`,
        {
          withCredentials: true,
          params: {
            searchTerm: value,
          },
        }
      );
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  function handleRoleFilter(role) {
    setStatusFilter(role);
  }

  const filteredUsers = users
    ? statusFilter === "all"
      ? users
      : users.filter(
          (user) =>
            user.roles?.includes(statusFilter) ||
            (statusFilter === "user" &&
              (!user.roles || user.roles.length === 0))
        )
    : [];

  function handleClearSearch() {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setUsers(null);
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  }

  function validateForm() {
    const errors = {};

    if (!newUser.name.trim()) {
      errors.name = "Name is required";
    }

    if (!newUser.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      errors.email = "Email is invalid";
    }

    if (!newUser.password) {
      errors.password = "Password is required";
    }

    return errors;
  }

  async function handleAddUser(e) {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setAddingUser(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}admin/users`,
        {
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          isAdmin: true,
        },
        {
          withCredentials: true,
        }
      );

      setNewUser({
        name: "",
        email: "",
        password: "",
      });
      setFormErrors({});
      setShowAddUserModal(false);

      // Refresh users list if there's a search term
      if (debouncedSearchTerm) {
        fetchUsers(debouncedSearchTerm);
      }

      alert("User created successfully!");
    } catch (error) {
      console.error("Error creating user:", error);
      if (error.response?.data?.message) {
        alert("Error: " + error.response.data.message);
      } else {
        alert("Error creating user. Please try again.");
      }
    } finally {
      setAddingUser(false);
    }
  }

  function closeModal() {
    setShowAddUserModal(false);
    setNewUser({
      name: "",
      email: "",
      password: "",
    });
    setFormErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  return (
    <div className="bg-white shadow rounded-lg mx-auto overflow-hidden">
      <DashboardHeader
        title={"Search Students and Instructors"}
        description={"Search for students and instructors."}
        role="admin"
      />

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => debouncedSearch(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <XCircle className="h-5 w-5" />
              </button>
            )}
            {searchTerm && searchTerm !== debouncedSearchTerm && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                <Clock className="h-4 w-4 text-gray-400 animate-pulse" />
              </div>
            )}
          </div>

          <button
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleRoleFilter("all")}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              statusFilter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleRoleFilter("admin")}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              statusFilter === "admin"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            Admins
          </button>
          <button
            onClick={() => handleRoleFilter("instructor")}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              statusFilter === "instructor"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            Instructors
          </button>
          <button
            onClick={() => handleRoleFilter("student")}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              statusFilter === "student"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            Students
          </button>
          <button
            onClick={() => handleRoleFilter("user")}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              statusFilter === "user"
                ? "bg-gray-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            Regular Users
          </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : users ? (
            filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredUsers.map((user) => (
                  <UserCard
                    key={user.username}
                    user={user}
                    setDetailUser={setDetailUser}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No users found matching your search criteria.
              </div>
            )
          ) : (
            <div className="text-center py-8 text-gray-500">
              <User className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p>Enter a search term to find users</p>
            </div>
          )}
        </div>
      </div>

      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Add New User
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newUser.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter name"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter email address"
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.password ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.password}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={addingUser}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingUser}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingUser ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </div>
                  ) : (
                    "Create User"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersAdminDashboard;
