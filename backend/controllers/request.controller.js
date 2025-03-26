const Course = require("../models/course.model");
const {
  Request,
  RequestType,
  RequestStatus,
} = require("../models/request.model");

async function createRequest(req, res) {
  try {
    const {
      title,
      description,
      requestType,
      relatedEntities,
      attachments = [],
      requestedChanges = {},
    } = req.body;

    const { id: userId, roles } = req.user;

    if (
      !title ||
      !description ||
      !requestType ||
      !relatedEntities ||
      !relatedEntities.entityType ||
      !relatedEntities.entityId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const instructorRequestTypes = Object.values(RequestType.instructorRequest);
    const studentRequestTypes = Object.values(RequestType.studentRequest);

    if (
      !instructorRequestTypes.includes(requestType) &&
      !studentRequestTypes.includes(requestType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid request type",
      });
    }

    let result;

    if (relatedEntities.entityType === "Course") {
      result = await Course.findOne({
        courseId: relatedEntities.entityId,
      });
    }
    if (relatedEntities.entityType === "Lecture") {
      result = await Lecture.findOne({
        lectureId: relatedEntities.entityId,
      });
    }

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Invalid related entity",
      });
    }

    const existingRequest = await Request.findOne({
      title,
      requestType,
      "relatedEntities.entityId": result._id,
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Request already exists",
      });
    }

    if (instructorRequestTypes.includes(requestType)) {
      if (!roles.includes("instructor")) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to make instructor requests",
        });
      }
      return await handleInstructorRequest(req, res);
    }

    if (studentRequestTypes.includes(requestType)) {
      if (!roles.includes("student")) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to make student requests",
        });
      }
      return await handleStudentRequest(req, res);
    }
  } catch (error) {
    console.error("Error creating request:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function handleInstructorRequest(req, res) {
  try {
    const {
      title,
      description,
      requestType,
      relatedEntities,
      attachments = [],
      requestedChanges = {},
    } = req.body;

    const { id: userId, name, roles } = req.user;
    let result;
    if (relatedEntities.entityType === "Course") {
      result = await Course.findOne({
        courseId: relatedEntities.entityId,
      });
      if (!result || result.instructor.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission for this course",
        });
      }
    }

    if (relatedEntities.entityType === "Lecture") {
      result = await Lecture.findOne({
        lectureId: relatedEntities.entityId,
      });
      if (!result || result.instructor.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission for this lecture",
        });
      }
    }

    const newRequest = new Request({
      title,
      description,
      requestType,
      status: RequestStatus.PENDING,
      requestedBy: userId,
      requesterRole: "instructor",
      relatedEntities: {
        entityType: relatedEntities.entityType,
        entityId: result._id,
      },
      attachments,
      requestedChanges,
    });

    await newRequest.save();

    return res.status(201).json({
      success: true,
      message: "Instructor request created successfully",
      data: newRequest,
    });
  } catch (error) {
    console.error("Error creating instructor request:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}


async function handleStudentRequest(req, res) {
  try {
    const {
      title,
      description,
      requestType,
      relatedEntities,
      attachments = [],
      requestedChanges = {},
    } = req.body;

    const { id: userId, name, roles } = req.user;

    // Student-specific validation
    // For example, validating if the student is enrolled in the course
    if (requestType === RequestType.studentRequest.RESET_QUIZ_ATTEMPTS) {
      // Validate that the student has attempted the quiz
      // const quiz = await Quiz.findById(relatedEntities.entityId);
      // const attempts = await QuizAttempt.find({
      //   quizId: relatedEntities.entityId,
      //   studentId: userId
      // });
      // if (!attempts || attempts.length === 0) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "No quiz attempts found to reset",
      //   });
      // }
    }

    const newRequest = new Request({
      title,
      description,
      requestType,
      status: RequestStatus.PENDING,
      requestedBy: userId,
      requesterRole: "student",
      relatedEntities,
      attachments,
      requestedChanges,
    });

    await newRequest.save();

    return res.status(201).json({
      success: true,
      message: "Student request created successfully",
      data: newRequest,
    });
  } catch (error) {
    console.error("Error creating student request:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function addComment(req, res) {
  try {
    const { comment } = req.body;
    const { id: userId, name, roles } = req.user;
    const { requestId } = req.params;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: "Comment is required",
      });
    }

    const request = await Request.findOne({ requestId });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    console.log(
      request.requestedBy.toString(),
      userId,
      request.assignedTo.toString(),
      userId
    );

    if (
      request.requestedBy.toString() !== userId &&
      request.assignedTo.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to comment on this request",
      });
    }

    request.comments.push({
      comment,
      commentedBy: userId,
      commenterRole: roles.includes("admin") ? "admin" : "instructor",
    });

    await request.save();

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: request.comments,
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function getMyRequests(req, res) {
  try {
    const instructor = req.user;

    const requests = await Request.find({
      requestedBy: instructor.id,
      requesterRole: "instructor",
    })
      .select(
        "title description requestId status createdAt updatedAt comments -_id"
      )
      .populate("comments.commentedBy", "name email username -_id")
      .populate("requestedBy", "name email username -_id")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: error.message,
    });
  }
}

async function getStudentRequests(req, res) {
  try {
    const instructor = req.user;

    const requests = await Request.find({
      assignedTo: instructor.id,
      requesterRole: "student",
    })
      .select(
        "title description requestId status createdAt updatedAt comments -_id"
      )
      .populate("comments.commentedBy", "name email username -_id")
      .sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: error.message,
    });
  }
}

async function getRequests(req, res) {
  try {
    const requests = await Request.find({ assignedTo: req.user.id })
      .select(
        "title description requestId status createdAt updatedAt comments -_id"
      )
      .populate("comments.commentedBy", "name email username -_id")
      .populate("requestedBy", "name email username -_id")
      .sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: error.message,
    });
  }
}

async function updateRequest(req, res) {
  try {
    const { requestId } = req.params;
    const { note, status } = req.body;
    const { id: userId, name, roles } = req.user;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const request = await Request.findOne({ requestId });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.assignedTo.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this request",
      });
    }

    request.status = status;
    request.adminNote = note || "";

    if (status === RequestStatus.APPROVED) {
      request.resolution = {
        action: "APPROVED",
        reason: note,
        resolvedBy: userId,
      };
      request.resolvedAt = new Date();
    }

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Request updated successfully",
      data: request,
    });
  } catch (error) {
    console.error("Error updating request:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

async function deleteRequest(req, res) {
  try {
    const { requestId } = req.params;
    const { id: userId } = req.user;

    const request = await Request.findOne({ requestId });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.requestedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this request",
      });
    }

    if (
      request.status === RequestStatus.APPROVED ||
      request.status === RequestStatus.REJECTED ||
      request.status === RequestStatus.IN_REVIEW
    ) {
      return res.status(400).json({
        success: false,
        message: "Request cannot be deleted",
      });
    }

    await Request.findOneAndDelete(requestId);

    return res.status(200).json({
      success: true,
      message: "Request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting request:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

module.exports = {
  createRequest,
  handleInstructorRequest,
  handleStudentRequest,
  addComment,
  getMyRequests,
  getStudentRequests,
  getRequests,
  updateRequest,
  deleteRequest,
};
