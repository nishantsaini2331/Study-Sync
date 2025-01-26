const Course = require("../models/course.model");
const Lecture = require("../models/lecture.model");
const MCQ = require("../models/mcq.model");
const User = require("../models/user.model");
const {
  uploadMedia,
  deleteMediaFromCloudinary,
  deleteVideoFromCloudinary,
} = require("../utils/cloudinary");
const ShortUniqueId = require("short-unique-id");
const { randomUUID } = new ShortUniqueId({ length: 6 });

async function createCourse(req, res) {
  try {
    const user = req.user;
    const { title, description, price, minimumSkill, language } = req.body;
    const tags = JSON.parse(req.body.tags);
    const thumbnail = req.files.thumbnail[0];
    const previewVideo = req.files.previewVideo[0];
    if (
      !tags ||
      !thumbnail ||
      !previewVideo ||
      !user ||
      !title ||
      !description ||
      !price ||
      !minimumSkill ||
      !language
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const { secure_url: thumbnailUrl, public_id: thumbnailId } =
      await uploadMedia(
        `data:image/jpeg;base64,${thumbnail.buffer.toString("base64")}`
      );

    const {
      secure_url: previewVideoUrl,
      public_id: previewVideoId,
      duration,
    } = await uploadMedia(
      `data:video/mp4;base64,${previewVideo.buffer.toString("base64")}`
    );

    const courseId =
      title.split(" ").join("-").toLowerCase() + "-" + randomUUID();

    const course = await Course.create({
      title,
      description,
      price,
      minimumSkill,
      instructor: user.id,
      tags,
      thumbnail: thumbnailUrl,
      thumbnailId,
      previewVideo: previewVideoUrl,
      previewVideoId,
      language,
      courseId,
    });

    await User.findByIdAndUpdate(user.id, {
      $push: { createdCourses: course._id },
    });

    return res.status(201).json({ success: true, message: "Course created" });

    // const course = new Course(req.body);
    // await course.save();
    // res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function getCourses(req, res) {
  try {
    const user = req.user;

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const courses = await Course.find({ instructor: user.id });
    return res.status(200).json({ success: true, courses });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

async function getCourse(req, res) {
  try {
    const courseId = req.params.id;
    const course = await Course.findOne({ courseId }).populate(
      "instructor lectures"
    );

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }
    return res.status(200).json({ success: true, course });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function updateCourse(req, res) {
  try {
    const courseId = req.params.id;
    const course = await Course.findOne({ courseId });
    const user = req.user;

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const { title, description, price, minimumSkill, language } = req.body;
    const tags = JSON.parse(req.body.tags);
    if (
      !tags ||
      !title ||
      !description ||
      !price ||
      !minimumSkill ||
      !language
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (req?.files?.thumbnail) {
      await deleteMediaFromCloudinary(course.thumbnailId);
      const { secure_url: thumbnailUrl, public_id: thumbnailId } =
        await uploadMedia(
          `data:image/jpeg;base64,${req.files.thumbnail[0].buffer.toString(
            "base64"
          )}`
        );
      course.thumbnail = thumbnailUrl;
      course.thumbnailId = thumbnailId;
    }

    if (req?.files?.previewVideo) {
      await deleteVideoFromCloudinary(course.previewVideoId);
      const { secure_url: previewVideoUrl, public_id: previewVideoId } =
        await uploadMedia(
          `data:video/mp4;base64,${req.files.previewVideo[0].buffer.toString(
            "base64"
          )}`
        );
      course.previewVideo = previewVideoUrl;
      course.previewVideoId = previewVideoId;
    }

    console.log("object");

    course.title = title;
    course.description = description;
    course.price = price;
    course.minimumSkill = minimumSkill;
    course.language = language;
    course.tags = tags;

    await course.save();

    return res.status(200).json({ success: true, message: "Course updated" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function deleteCourse(req, res) {
  try {
    const courseId = req.params.id;
    const course = await Course.findOne({ courseId });
    const user = req.user;

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }
    const deletedCourse = await Course.findByIdAndDelete(course._id);

    await deleteMediaFromCloudinary(deletedCourse.thumbnailId);
    await deleteVideoFromCloudinary(deletedCourse.previewVideoId);
    
    const lectures = await Lecture.find({ course: deletedCourse._id });
    for (let lecture of lectures) {
      await deleteVideoFromCloudinary(lecture.videoId);
      if (lecture.mcqs.length > 0) {
        await MCQ.deleteMany({ _id: { $in: lecture.mcqs } });
      }
      await Lecture.findByIdAndDelete(lecture._id);
    }

    
    const users = await User.find({ enrolledCourses: deletedCourse._id });
    for (let user of users) {
      await User.findByIdAndUpdate(user._id, {
        $pull: { enrolledCourses: deletedCourse._id },
      });
    }

    await User.findByIdAndUpdate(deletedCourse.instructor, {
      $pull: { createdCourses: deletedCourse._id },
    });

    return res.status(200).json({ success: true, message: "Course deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

module.exports = {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
};
