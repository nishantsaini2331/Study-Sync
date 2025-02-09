const Course = require("../models/course.model");
const FinalQuiz = require("../models/finalQuiz.model");
const MCQ = require("../models/mcq.model");

function validateQuiz(quiz) {
  if (!quiz || !quiz.length) {
    throw new Error("Quiz is required");
  }

  if (quiz.length < 5) {
    throw new Error("Minimum 5 MCQs required");
  }

  if (quiz.length > 20) {
    throw new Error("Maximum 20 MCQs allowed");
  }

  quiz.forEach((mcq, index) => {
    if (!mcq.question.trim()) {
      throw new Error(`Question ${index + 1} is empty`);
    }

    if (mcq.correctOption === null || mcq.correctOption === undefined) {
      throw new Error(`Correct option not selected for question ${index + 1}`);
    }

    if (!mcq.options || mcq.options.length < 2) {
      throw new Error(
        `At least two options required for question ${index + 1}`
      );
    }

    mcq.options.forEach((option, optIndex) => {
      if (!option.trim()) {
        throw new Error(
          `Option ${optIndex + 1} is empty in question ${index + 1}`
        );
      }
    });
  });
}

async function createFinalQuiz(req, res) {
  try {
    const user = req.user;
    const { courseId } = req.params;
    const { quiz } = req.body;

    const course = await Course.findOne({ courseId });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (course.instructor.toString() !== user.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    try {
      validateQuiz(quiz);
    } catch (validationError) {
      return res
        .status(400)
        .json({ success: false, message: validationError.message });
    }

    const mcqIds = [];

    for (let mcq of quiz) {
      const createdMcq = await MCQ.create({
        course: course._id,
        question: mcq.question,
        options: mcq.options,
        correctOption: mcq.correctOption,
      });
      mcqIds.push(createdMcq._id);
    }

    const finalQuiz = await FinalQuiz.create({
      course: course._id,
      mcqs: mcqIds,
    });

    await Course.findByIdAndUpdate(course._id, { finalQuiz: finalQuiz._id });

    return res.status(201).json({ success: true, finalQuiz });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

async function getFinalQuiz(req, res) {
  try {
    const user = req.user;
    const { courseId } = req.params;
    const course = await Course.findOne({ courseId }).populate("finalQuiz");

    if (course.instructor.toString() !== user.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (!course.finalQuiz) {
      return res
        .status(404)
        .json({ success: false, message: "Final quiz not found" });
    }

    const finalQuiz = await FinalQuiz.findById(course.finalQuiz).populate(
      "mcqs"
    );

    res.status(200).json({ success: true, finalQuiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async function updateFinalQuiz(req, res) {
  try {
    const user = req.user;
    const { courseId } = req.params;
    const { quiz } = req.body;

    const course = await Course.findOne({ courseId });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (course.instructor.toString() !== user.id) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    try {
      validateQuiz(quiz);
    } catch (validationError) {
      return res
        .status(400)
        .json({ success: false, message: validationError.message });
    }

    const existingFinalQuiz = await FinalQuiz.findById(course.finalQuiz);

    if (!existingFinalQuiz) {
      return res
        .status(404)
        .json({ success: false, message: "Final quiz not found" });
    }

    const existingMcqIds = existingFinalQuiz.mcqs.map((mcq) => mcq.toString());

    const newMcqIds = quiz.map((mcq) => mcq._id);

    const mcqIdsToDelete = existingMcqIds.filter(
      (id) => !newMcqIds.includes(id)
    );

    if (mcqIdsToDelete.length > 0) {
      await MCQ.deleteMany({ _id: { $in: mcqIdsToDelete } });
      await FinalQuiz.findByIdAndUpdate(existingFinalQuiz._id, {
        $pull: { mcqs: { $in: mcqIdsToDelete } },
      });
    }

    for (let mcq of quiz) {
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
          course: course._id,
          question: mcq.question,
          options: mcq.options,
          correctOption: mcq.correctOption,
        });
        existingFinalQuiz.mcqs.push(newMcq._id);
      }
    }

    await existingFinalQuiz.save();

    res.status(200).json({ success: true, message: "Final quiz updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
  createFinalQuiz,
  getFinalQuiz,
  updateFinalQuiz,
};
