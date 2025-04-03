import { XCircle, Search, Clock, User } from "lucide-react";
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

  return (
    <div className="bg-white shadow rounded-lg mx-auto overflow-hidden">
      <DashboardHeader
        title={"Search Students and Instructors"}
        description={"Search for students and instructors."}
        role="admin"
      />

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
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
    </div>
  );
}

export default UsersAdminDashboard;
