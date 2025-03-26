const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");
const { ADMIN_USER_ID } = require("../config/dotenv");

const RequestType = {
  instructorRequest: {
    CREATE_COURSE: "CREATE_COURSE",
    EDIT_COURSE: "EDIT_COURSE",
    DELETE_COURSE: "DELETE_COURSE",
    ADD_MODULE: "ADD_MODULE",
    EDIT_MODULE: "EDIT_MODULE",
    DELETE_MODULE: "DELETE_MODULE",
    EDIT_FINAL_QUIZ: "EDIT_FINAL_QUIZ",
  },
  studentRequest: {
    RESET_QUIZ_ATTEMPTS: "RESET_QUIZ_ATTEMPTS",
    EXTENSION_REQUEST: "EXTENSION_REQUEST",
    REFUND_REQUEST: "REFUND_REQUEST",
    CERTIFICATE_ISSUE: "CERTIFICATE_ISSUE",
  },
};

const RequestStatus = {
  PENDING: "PENDING",
  IN_REVIEW: "IN_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

const RequestSchema = new Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      default: () => `REQ-${uuidv4().split("-")[0].toUpperCase()}`,
    },

    requestType: {
      type: String,
      required: true,
      enum: [
        ...Object.values(RequestType.instructorRequest),
        ...Object.values(RequestType.studentRequest),
      ],
    },

    status: {
      type: String,
      required: true,
      enum: Object.values(RequestStatus),
      default: RequestStatus.PENDING,
    },

    requestedBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    requesterRole: {
      type: String,
      required: true,
      enum: ["instructor", "student", "admin"],
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    relatedEntities: {
      entityType: {
        type: String,
        enum: ["Course", "Lecture", "Quiz", "User"],
        required: true,
      },
      entityId: {
        type: Schema.Types.ObjectId,
        refPath: "relatedEntities.entityType",
        required: true,
      },
    },

    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    requestedChanges: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: ADMIN_USER_ID,
    },

    resolvedAt: {
      type: Date,
    },

    comments: [
      {
        comment: String,
        commentedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        commenterRole: {
          type: String,
          enum: ["instructor", "student", "admin"],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    adminNote: {
      type: String,
    },

    resolution: {
      action: String,
      reason: String,
      resolvedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
  },
  {
    timestamps: true,
  }
);

RequestSchema.index({ requestId: 1 });
RequestSchema.index({ status: 1 });
RequestSchema.index({ requestedBy: 1 });
RequestSchema.index({ courseId: 1 });
RequestSchema.index({ requestType: 1 });
RequestSchema.index({ assignedTo: 1 });
RequestSchema.index({
  "relatedEntities.entityType": 1,
  "relatedEntities.entityId": 1,
});

RequestSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

RequestSchema.statics.findByCourse = function (courseId) {
  return this.find({
    "relatedEntities.entityType": "Course",
    "relatedEntities.entityId": courseId,
  });
};

RequestSchema.methods.approve = function (adminId, notes) {
  this.status = RequestStatus.APPROVED;
  this.resolution = {
    action: "APPROVED",
    reason: notes,
    resolvedBy: adminId,
  };
  this.resolvedAt = Date.now();
  return this.save();
};

RequestSchema.methods.reject = function (adminId, reason) {
  this.status = RequestStatus.REJECTED;
  this.resolution = {
    action: "REJECTED",
    reason: reason,
    resolvedBy: adminId,
  };
  this.resolvedAt = Date.now();
  return this.save();
};

RequestSchema.methods.addComment = function (text, userId, userRole) {
  this.comments.push({
    text: text,
    commentedBy: userId,
    commenterRole: userRole,
  });
  return this.save();
};

const Request = mongoose.model("Request", RequestSchema);

module.exports = {
  Request,
  RequestType,
  RequestStatus,
};
