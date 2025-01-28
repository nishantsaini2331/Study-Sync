const Course = require("../models/course.model");
const FinalQuiz = require("../models/finalQuiz.model");
const MCQ = require("../models/mcq.model");

async function createFinalQuiz(req, res) {
  try {
    const user = req.user;
    const { courseId } = req.params;
    const { quiz } = req.body;

    const course = await Course.findOne({ courseId });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (course.instructor.toString() !== user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (!quiz || !quiz.length) {
      return res.status(400).json({ error: "Quiz is required" });
    }

    if (quiz.length < 5) {
      return res.status(400).json({ error: "Minimum 5 MCQs required" });
    }

    if (quiz.length > 20) {
      return res.status(400).json({ error: "Maximum 20 MCQs allowed" });
    }

    quiz.forEach((mcq, index) => {
      if (!mcq.question.trim()) {
        return res
          .status(400)
          .json({ error: `Question ${index + 1} is empty` });
      }

      if (mcq.correctOption === null) {
        return res.status(400).json({
          error: `Correct option not selected for question ${index + 1}`,
        });
      }

      mcq.options.forEach((option, optIndex) => {
        if (!option.trim()) {
          return res.status(400).json({
            error: `Option ${optIndex + 1} is empty in question ${index + 1}`,
          });
        }
      });
    });

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

    res.status(201).json({ success: true, finalQuiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getFinalQuiz(req, res) {
  try {
    const { courseId } = req.params;
    const course = await Course.findOne({ courseId }).populate("finalQuiz");

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (!course.finalQuiz) {
      return res.status(404).json({ error: "Final quiz not found" });
    }

    const finalQuiz = await FinalQuiz.findById(course.finalQuiz).populate(
      "mcqs"
    );

    res.status(200).json({ success: true, finalQuiz });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  createFinalQuiz,
  getFinalQuiz,
};
