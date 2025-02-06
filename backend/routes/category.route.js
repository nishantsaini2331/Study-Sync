const express = require("express");

const {
  createCategory,
  showAllCategories,
  updateCategory,
  deleteCategory,
  showAllCategoriesName,
} = require("../controllers/category.controller");

const { auth, admin } = require("../middlewares/auth");

const router = express.Router();

router
  .route("/")
  .post(auth, admin, createCategory)
  .get(auth, showAllCategoriesName);

router
  .route("/:id")
  .put(auth, admin, updateCategory)
  .delete(auth, admin, deleteCategory);

module.exports = router;
