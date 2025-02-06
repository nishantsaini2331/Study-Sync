import {
  BookOpen,
  ChartBarBig,
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
            <div
              onClick={() => setActiveTab(key)}
              className={`flex items-center p-4 text-gray-700 hover:bg-gray-50 cursor-pointer ${
                activeTab === key ? "bg-gray-50" : ""
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {label}
            </div>
            <div className="border-t border-gray-200 my-1"></div>
          </React.Fragment>
        ))}
      </nav>
    </div>
  );
}

export default AdminDashboardSidebar;
