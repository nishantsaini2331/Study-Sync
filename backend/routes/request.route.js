const express = require("express");
const router = express.Router();

const {
  createRequest,
  addComment,
  getMyRequests,
  getStudentRequests,
  getRequests,
  updateRequest,
  deleteRequest,
} = require("../controllers/request.controller");
const {
  auth,
  isInstructorOrAdminOrStudent,
  isInstructorOrAdmin,
  isInstructorOrStudent,
  admin,
} = require("../middlewares/auth");

router.post("/", auth, createRequest);
router.post("/:requestId/comment", auth, addComment);
router.get("/my-requests", auth, isInstructorOrStudent, getMyRequests);
router.get("/student-requests", auth, isInstructorOrAdmin, getStudentRequests);
router.get("/admin-requests", auth, admin, getRequests);
router.put("/:requestId/update", auth, isInstructorOrAdmin, updateRequest);
router.delete("/:requestId/delete", auth, isInstructorOrStudent, deleteRequest);
module.exports = router;
