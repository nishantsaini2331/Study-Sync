import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Search } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

function Category() {
  const [categories, setCategories] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  async function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleAddCategory(e) {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}category`,
        formData,
        { withCredentials: true }
      );
      setCategories((prev) => [...prev, res.data.category]);
      toast.success(res.data.message || "Category added successfully.");
    } catch (error) {
      console.log(error);
      toast.error(
        error.response.data.message || "An error occurred. Please try again."
      );
    } finally {
      setFormData({ name: "", description: "" });
      setIsAddModalOpen(false);
    }
  }

  async function handleEditCategory(e) {
    e.preventDefault();

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}category/${currentCategory._id}`,
        formData,
        { withCredentials: true }
      );

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === currentCategory.id ? { ...cat, ...formData } : cat
        )
      );
      toast.success(res.data.message || "Category updated successfully.");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsEditModalOpen(false);
      setCurrentCategory(null);
      setFormData({ name: "", description: "" });
    }
  }

  async function handleDeleteCategory(id) {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const res = await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}category/${id}`,
          {
            withCredentials: true,
          }
        );
        setCategories((prev) => prev.filter((cat) => cat._id !== id));
        toast.success(res.data.message || "Category deleted successfully.");
      } catch (error) {
        toast.error("An error occurred. Please try again.");
      }
    }
  }

  function openEditModal(category) {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
    });
    setIsEditModalOpen(true);
  }

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    async function fetchCategories() {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}category/all`,
        { withCredentials: true }
      );
      setCategories(res.data.categories);
    }
    fetchCategories();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Category Management
        </h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 pl-10 border rounded-lg"
        />
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 p-4">
          {filteredCategories.map((category) => (
            <div
              key={category._id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mt-1">{category.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(category)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredCategories.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No categories found
            </div>
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Category</h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setFormData({ name: "", description: "" });
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCategory}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows="3"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setFormData({ name: "", description: "" });
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Category</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setFormData({ name: "", description: "" });
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditCategory}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows="3"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setFormData({ name: "", description: "" });
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Category;
