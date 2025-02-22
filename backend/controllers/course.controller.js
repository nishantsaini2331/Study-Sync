const Category = require("../models/category.model");
const Course = require("../models/course.model");
const CourseVerify = require("../models/courseVerify.model");
const FinalQuiz = require("../models/finalQuiz.model");
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
    const {
      title,
      description,
      price,
      minimumSkill,
      language,
      requiredCompletionPercentage,
      category,
    } = req.body;
    const whatYouWillLearn = JSON.parse(req.body.whatYouWillLearn);
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
      !language ||
      !requiredCompletionPercentage ||
      !category ||
      !whatYouWillLearn
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (!Array.isArray(whatYouWillLearn) || whatYouWillLearn.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid what you will learn",
      });
    }

    if (whatYouWillLearn.length > 7) {
      return res.status(400).json({
        success: false,
        message: "What you will learn should not be more than 7",
      });
    }

    const checkCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${category}$`, "i") },
    });

    if (!checkCategory) {
      return res.status(400).json({
        message: "Please enter valid category",
        success: false,
      });
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
      requiredCompletionPercentage,
      category: checkCategory._id,
      whatYouWillLearn,
    });

    await Category.findByIdAndUpdate(checkCategory._id, {
      $push: { courses: course._id },
    });
    await User.findByIdAndUpdate(user.id, {
      $push: { createdCourses: course._id },
      $inc: { "instructorProfile.totalCourses": 1 },
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
    const course = await Course.findOne({ courseId })
      .populate("instructor lectures")
      .populate({
        path: "finalQuiz",
        populate: {
          path: "mcqs",
        },
      })
      .populate({
        path: "category",
        select: "name",
      });

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
    const course = await Course.findOne({ courseId }).populate("category");
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

    const {
      title,
      description,
      price,
      minimumSkill,
      language,
      requiredCompletionPercentage,
      category,
    } = req.body;

    const tags = JSON.parse(req.body.tags);
    const whatYouWillLearn = JSON.parse(req.body.whatYouWillLearn);

    if (
      !tags ||
      !title ||
      !description ||
      !price ||
      !minimumSkill ||
      !language ||
      !requiredCompletionPercentage ||
      !category ||
      !whatYouWillLearn
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (!Array.isArray(whatYouWillLearn) || whatYouWillLearn.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid what you will learn",
      });
    }

    if (whatYouWillLearn.length > 7) {
      return res.status(400).json({
        success: false,
        message: "What you will learn should not be more than 7",
      });
    }

    const checkCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${category}$`, "i") },
    });

    if (!checkCategory) {
      return res.status(400).json({
        message: "Please enter valid category",
        success: false,
      });
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

    if (
      checkCategory.name.toLowerCase() !== course.category.name.toLowerCase()
    ) {
      //   Promise.all([
      //     await Category.findOneAndUpdate(course.category._id, {
      //       $pull: { courses: course._id },
      //     }),
      //     await Category.findByIdAndUpdate(checkCategory._id, {
      //       $push: { courses: course._id },
      //     }),
      //   ]);

      await Category.findOneAndUpdate(course.category._id, {
        $pull: { courses: course._id },
      });

      course.category = checkCategory._id;

      await Category.findByIdAndUpdate(checkCategory._id, {
        $push: { courses: course._id },
      });
    }

    course.title = title;
    course.description = description;
    course.price = price;
    course.minimumSkill = minimumSkill;
    course.language = language;
    course.tags = tags;
    course.requiredCompletionPercentage = requiredCompletionPercentage;
    course.whatYouWillLearn = whatYouWillLearn;

    await course.save();

    return res.status(200).json({ success: true, message: "Course updated" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function deleteCourse(req, res) {
  try {
    const courseId = req.params.id;
    const course = await Course.findOne({ courseId }).populate("finalQuiz");
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

    await Category.findByIdAndUpdate(deletedCourse.category, {
      $pull: { courses: deletedCourse._id },
    });

    await CourseVerify.findByIdAndDelete(deletedCourse.courseVerification);

    for (let mcq of course.finalQuiz.mcqs) {
      await MCQ.findByIdAndDelete(mcq);
    }

    await FinalQuiz.findByIdAndDelete(course.finalQuiz._id);

    return res.status(200).json({ success: true, message: "Course deleted" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function getCoursesBySearchQuery(req, res) {
  try {
    const { search: title, language, category } = req.query;

    const checkCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${category}$`, "i") },
    });

    let query = { status: "published" };

    if (title) {
      query.title = { $regex: title, $options: "i" };
    }

    if (language) {
      query.language = { $regex: language, $options: "i" };
    }

    if (category) {
      query.category = checkCategory._id;
    }

    const courses = await Course.find(query)
      .populate({
        path: "instructor",
        select: "name username -_id",
      })
      .populate({
        path: "category",
        select: "name -_id",
      })
      .select(
        "title description price thumbnail language courseId enrolledStudents -_id"
      );

    const formattedCourses = courses.map((course) => {
      return {
        ...course.toObject(),
        enrolledStudents: course.enrolledStudents.length,
      };
    });

    res.status(200).json({
      success: true,
      results: courses.length,
      courses: formattedCourses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
}

async function getCourseForStudent(req, res) {
  try {
    const courseId = req.params.id;
    const course = await Course.findOne({ courseId })
      .populate({
        path: "instructor",
        select: "name username photoUrl -_id",
      })
      .populate({
        path: "lectures",
        select: "title description duration -_id",
      })
      .select(
        "title description price thumbnail language courseId previewVideo minimumSkill lectures language whatYouWillLearn -_id"
      );

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // const totalDuration = course.lectures.reduce((acc, curr) => {
    //   return acc + curr.duration;
    // }, 0);

    // const formattedCourse = {
    //   ...course.toObject(),
    //   lectures: course.lectures.length,
    // };

    return res.status(200).json({ success: true, course });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function checkStudentEnrollment(req, res) {
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

    const isEnrolled = course.enrolledStudents.includes(user.id);

    return res.status(200).json({ success: true, isEnrolled });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

async function checkInstructor(req, res) {
  try {
    const id = req.params.id;
    const instructor = req.user;
    if (!instructor) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const course = await Course.findOne({
      courseId: id,
      instructor: instructor.id,
    });

    if (course) {
      return res.status(200).json({ success: true, isOwner: true });
    }

    const lecture = await Lecture.findOne({
      lectureId: id,
    })
      .select("course")
      .populate({
        path: "course",
        select: "instructor -_id",
      });

    if (
      lecture?.course?.instructor?.toString() === instructor?.id?.toString()
    ) {
      return res.status(200).json({ success: true, isOwner: true });
    }
    return res
      .status(403)
      .json({ success: true, isOwner: false, message: "Unauthorised access" });
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
  getCoursesBySearchQuery,
  getCourseForStudent,
  checkStudentEnrollment,
  checkInstructor,
};
