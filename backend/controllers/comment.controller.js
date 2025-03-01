const Comment = require("../models/comment.model");
const Course = require("../models/course.model");
const Lecture = require("../models/lecture.model");

async function addComment(req, res) {
  try {
    const user = req.user;

    const { lectureId } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return res.status(500).json({
        message: "Please enter the comment",
      });
    }

    const lecture = await Lecture.findOne({ lectureId });

    const course = await Course.findById(lecture.course);

    if (!course) {
      return res.status(500).json({
        message: "Course not found",
      });
    }

    if (!lecture) {
      return res.status(500).json({
        message: "Lecture not found",
      });
    }

    if (
      user.id !== course.instructor.toString() &&
      !course.enrolledStudents.includes(user.id)
    ) {
      return res.status(400).json({
        success: false,
        message: "You are not valid user to add comment",
      });
    }

    const newComment = await Comment.create({
      comment,
      lecture: lecture._id,
      student: user.id,
      course: lecture.course,
      isInstructor: user.id === course.instructor.toString(),
    });

    await newComment.populate("student", "name email username profilePic");

    lecture.comments.push(newComment._id);
    await lecture.save();

    return res.status(200).json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function deleteComment(req, res) {
  try {
    const user = req.user;
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(500).json({
        message: "Comment is not found",
      });
    }

    const course = await Course.findById(comment.course);

    if (!course) {
      return res.status(500).json({
        message: "Course is not found",
      });
    }

    if (
      comment.student != user.id &&
      user.id !== course.instructor.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: "You are not valid user to delete this comment",
      });
    }

    async function deleteCommentAndReplies(id) {
      let comment = await Comment.findById(id);

      for (let replyId of comment.replies) {
        await deleteCommentAndReplies(replyId);
      }

      if (comment.parentComment) {
        await Comment.findByIdAndUpdate(comment.parentComment, {
          $pull: { replies: id },
        });
      }

      await Comment.findByIdAndDelete(id);
    }

    await deleteCommentAndReplies(id);

    await Lecture.findByIdAndUpdate(comment.lecture, {
      $pull: { comments: id },
    });

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function editComment(req, res) {
  try {
    const student = req.user;
    const { id } = req.params;
    const { updatedCommentText } = req.body;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(500).json({
        message: "Comment is not found",
      });
    }

    if (comment.student != student.id) {
      return res.status(400).json({
        success: false,
        message: "You are not valid user to edit this comment",
      });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      {
        comment: updatedCommentText,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      updatedComment,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function likeDislikeComment(req, res) {
  try {
    const student = req.user;
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(500).json({
        message: "Comment is not found",
      });
    }

    if (comment.likes.includes(student.id)) {
      await Comment.findByIdAndUpdate(id, {
        $pull: { likes: student.id },
      });

      return res.status(200).json({
        success: true,
        message: "Comment unliked successfully",
      });
    } else {
      await Comment.findByIdAndUpdate(id, {
        $push: { likes: student.id },
      });

      return res.status(200).json({
        success: true,
        message: "Comment liked successfully",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function addNestedComment(req, res) {
  try {
    const user = req.user;
    const { id } = req.params;
    const { reply, lectureId } = req.body;

    if (!reply) {
      return res.status(500).json({
        message: "Please enter the comment",
      });
    }

    const lecture = await Lecture.findOne({ lectureId });
    if (!lecture) {
      return res.status(500).json({
        message: "Lecture not found",
      });
    }
    const course = await Course.findById(lecture.course);

    if (!course) {
      return res.status(500).json({
        message: "Course not found",
      });
    }

    if (
      user.id !== course.instructor.toString() &&
      !course.enrolledStudents.includes(user.id)
    ) {
      return res.status(400).json({
        success: false,
        message: "You are not valid user to add comment",
      });
    }

    const parentComment = await Comment.findById(id);

    if (!parentComment) {
      return res.status(500).json({
        message: "Parent Comment not found",
      });
    }

    const newComment = await Comment.create({
      comment: reply,
      lecture: parentComment.lecture,
      student: user.id,
      course: parentComment.course,
      parentComment: parentComment._id,
      isInstructor: user.id === course.instructor.toString(),
    });

    await newComment.populate("student", "name email username profilePic");

    parentComment.replies.push(newComment._id);
    await parentComment.save();

    return res.status(200).json({
      success: true,
      message: "Comment added successfully",
      reply: newComment,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function pinComment(req, res) {
  try {
    const instructor = req.user;
    const { id } = req.params;

    const { isPinned } = req.body;

    const comment = await Comment.findById(id).populate("lecture");

    if (!comment) {
      return res.status(500).json({
        message: "Comment is not found",
      });
    }

    const course = await Course.findById(comment.course);

    if (!course) {
      return res.status(500).json({
        message: "Course is not found",
      });
    }

    if (instructor.id !== course.instructor.toString()) {
      return res.status(400).json({
        success: false,
        message: "You are not valid user to pin this comment",
      });
    }
    if (isPinned) {
      await Comment.findByIdAndUpdate(id, {
        isPinned: true,
      });
      return res.status(200).json({
        success: true,
        message: "Comment pinned successfully",
      });
    } else {
      await Comment.findByIdAndUpdate(id, {
        isPinned: false,
      });
      return res.status(200).json({
        success: true,
        message: "Comment unpinned successfully",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = {
  addComment,
  deleteComment,
  editComment,
  likeDislikeComment,
  addNestedComment,
  pinComment,
};
