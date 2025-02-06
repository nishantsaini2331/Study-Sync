const Category = require("../models/category.model");
const Course = require("../models/course.model");

async function createCategory(req, res) {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const category = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (category) {
      return res
        .status(400)
        .json({ success: false, message: "Category already exists" });
    }

    const CategorysDetails = await Category.create({
      name,
      description,
    });

    return res.status(200).json({
      success: true,
      message: "Category Created Successfully",
      category: CategorysDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      message: error.message,
    });
  }
}

async function showAllCategories(req, res) {
  try {
    const allCategories = await Category.find({});
    res.status(200).json({
      success: true,
      categories: allCategories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function showAllCategoriesName(req, res) {
  try {
    const allCategories = await Category.find({});

    let cate = allCategories.map((c) => c.name);
    res.status(200).json({
      success: true,
      categories: cate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function updateCategory(req, res) {
  try {
    const { name, description } = req.body;
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    category.name = name;
    category.description = description;
    await category.save();
    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function deleteCategory(req, res) {
  try {
    const categoryId = req.params.id;

    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await Course.updateMany(
      { category: categoryId },
      { $unset: { category: "" } }
    );

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

module.exports = {
  createCategory,
  showAllCategories,
  updateCategory,
  deleteCategory,
  showAllCategoriesName,
};
