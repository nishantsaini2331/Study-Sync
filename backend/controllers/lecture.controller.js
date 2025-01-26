const Course = require("../models/course.model");
const Lecture = require("../models/lecture.model");
const MCQ = require("../models/mcq.model");

const ShortUniqueId = require("short-unique-id");
const { randomUUID } = new ShortUniqueId({ length: 4 });

const {
  uploadMedia,
  deleteVideoFromCloudinary,
} = require("../utils/cloudinary");

async function createLecture(req, res) {
  try {
    const user = req.user;
    const courseId = req.params.id;
    const video = req.file;
    const mcqs = JSON.parse(req.body.mcqs);

    const { title, description, requiredPassPercentage } = req.body;

    if (!user || !courseId || !video || !mcqs) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const course = await Course.findOne({ courseId });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const {
      secure_url: videoUrl,
      public_id: videoId,
      duration,
    } = await uploadMedia(
      `data:video/mp4;base64,${video.buffer.toString("base64")}`
    );

    const lectureId =
      course.courseId + "-" + title.split(" ").join("-") + randomUUID();

    const lecture = await Lecture.create({
      title,
      description,
      videoUrl,
      videoId,
      course: course._id,
      duration,
      requiredPassPercentage,
      lectureId,
    });

    // Now create MCQs and associate them with the lecture

    await Course.findByIdAndUpdate(course._id, {
      $push: { lectures: lecture._id },
    });

    const mcqIds = [];
    for (let mcq of mcqs) {
      const createdMcq = await MCQ.create({
        lecture: lecture._id, // Assign the lecture ID here
        question: mcq.question,
        options: mcq.options,
        correctOption: mcq.correctOption,
      });
      mcqIds.push(createdMcq._id);
    }

    // Optionally update the lecture with the list of MCQs (if needed)
    lecture.mcqs = mcqIds;
    await lecture.save();

    res.status(201).json({
      success: true,
      message: "Lecture created successfully",
      lecture,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function getLecture(req, res) {
  try {
    const lectureId = req.params.id;
    const lecture = await Lecture.findOne({ lectureId }).populate("mcqs");
    if (!lecture) {
      return res
        .status(404)
        .json({ success: false, message: "Lecture not found" });
    }
    res.status(200).json({ success: true, lecture });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function updateLecture(req, res) {
  try {
    const lectureId = req.params.id;
    const { title, description, requiredPassPercentage } = req.body;

    const mcqs = req.body.mcqs ? JSON.parse(req.body.mcqs) : [];
    const video = req.file;

    const lecture = await Lecture.findOne({ lectureId }).populate("mcqs");

    if (!lecture) {
      return res
        .status(404)
        .json({ success: false, message: "Lecture not found" });
    }

    const existingMcqIds = lecture.mcqs.map((mcq) => mcq._id.toString());
    const newMcqIds = mcqs.map((mcq) => mcq._id);
    const mcqIdsToDelete = existingMcqIds.filter(
      (id) => !newMcqIds.includes(id)
    );

    if (mcqIdsToDelete.length > 0) {
      await MCQ.deleteMany({ _id: { $in: mcqIdsToDelete } });
      await Lecture.findByIdAndUpdate(lecture._id, {
        $pull: { mcqs: { $in: mcqIdsToDelete } },
      });
    }

    for (let mcq of mcqs) {
      if (mcq._id) {
        const existingMcq = await MCQ.findById(mcq._id);
        if (existingMcq) {
          existingMcq.question = mcq.question;
          existingMcq.options = mcq.options;
          existingMcq.correctOption = mcq.correctOption;
          await existingMcq.save();
        } else {
          return res.status(404).json({
            success: false,
            message: `MCQ with ID ${mcq._id} not found`,
          });
        }
      } else {
        const newMcq = await MCQ.create({
          lecture: lecture._id,
          question: mcq.question,
          options: mcq.options,
          correctOption: mcq.correctOption,
        });
        lecture.mcqs.push(newMcq._id);
      }
    }

    lecture.title = title || lecture.title;
    lecture.description = description || lecture.description;
    lecture.requiredPassPercentage =
      requiredPassPercentage || lecture.requiredPassPercentage;

    if (video) {
      await deleteVideoFromCloudinary(lecture.videoId);
      const { secure_url: videoUrl, public_id: videoId } = await uploadMedia(
        `data:video/mp4;base64,${video.buffer.toString("base64")}`
      );
      lecture.videoUrl = videoUrl;
      lecture.videoId = videoId;
    }

    await lecture.save();

    res.status(200).json({
      success: true,
      message: "Lecture updated successfully",
      lecture,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function deleteLecture(req, res) {
  try {
    const lectureId = req.params.id;
    const lecture = await Lecture.findOne({ lectureId });

    if (!lecture) {
      return res
        .status(404)
        .json({ success: false, message: "Lecture not found" });
    }

    await Lecture.findByIdAndDelete(lecture._id);
    await MCQ.deleteMany({ _id: { $in: lecture.mcqs } });
    await deleteVideoFromCloudinary(lecture.videoId);
    await Course.findByIdAndUpdate(lecture.course, {
      $pull: { lectures: lecture._id },
    });

    res.status(200).json({
      success: true,
      message: "Lecture deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { createLecture, getLecture, updateLecture, deleteLecture };
