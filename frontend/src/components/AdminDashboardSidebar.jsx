import {
  BookOpen,
  ChartBarBig,
  ChevronRight,
  Home,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import React from "react";

const sidebarItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "courses", label: "Courses", icon: BookOpen },
  { key: "homepage", label: "Homepage", icon: Home },
  { key: "users", label: "Users", icon: Users },
  { key: "settings", label: "Settings", icon: Settings },
  { key: "category", label: "Category", icon: ChartBarBig },
  { key: "Request", label: "Request", icon: Users },
];

function AdminDashboardSidebar({ activeTab, setActiveTab }) {
  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-800">Admin Portal</h1>
      </div>
      <nav className="mt-4">
        {sidebarItems.map(({ key, label, icon: Icon }) => (
          <React.Fragment key={key}>
            <button
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                activeTab === key
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span>{label}</span>
              {activeTab === key && (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </button>
            <div className="border-t border-gray-200 my-1"></div>
          </React.Fragment>
        ))}
      </nav>
    </div>
  );
}

export default AdminDashboardSidebar;
