import React from "react";
import { User, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/formatDate";

function UserCard({ user, setDetailUser }) {
  function getRoleColor(role) {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "instructor":
        return "bg-blue-100 text-blue-800";
      case "student":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 flex flex-col sm:flex-row gap-4 mb-4">
      <div className="flex-shrink-0">
        {user.photoUrl ? (
          <img
            src={user.photoUrl}
            alt={`${user.name}'s profile`}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-8 h-8 text-gray-500" />
          </div>
        )}
      </div>

      <div className="flex-grow">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
            <p className="text-gray-600 text-sm">{user.email}</p>
            <p className="text-gray-500 text-xs mt-1">
              <span className="font-medium">Username:</span>{" "}
              {user.username || "N/A"}
            </p>
            <p className="text-gray-500 text-xs">
              <span className="font-medium">Created:</span>{" "}
              {formatDate(user.createdAt)}
            </p>
          </div>

          <div className="mt-2 sm:mt-0 flex flex-col items-start sm:items-end">
            <div className="flex flex-wrap gap-2 mb-2">
              {user.roles && user.roles.length > 0 ? (
                user.roles.map((role, index) => (
                  <span
                    key={index}
                    className={`${getRoleColor(
                      role
                    )} px-3 py-1 rounded-full text-xs font-medium`}
                  >
                    {role}
                  </span>
                ))
              ) : (
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                  user
                </span>
              )}
            </div>
            <button
              onClick={() => setDetailUser(user.username)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              View Profile
              <ExternalLink className="ml-1 w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserCard;
