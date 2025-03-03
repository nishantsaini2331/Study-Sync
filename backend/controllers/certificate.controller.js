const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const CourseCertification = require("../models/certificate.model");
const Course = require("../models/course.model");
const CourseProgress = require("../models/courseProgress.model");

async function downloadCertificate(req, res) {
  let browser = null;
  try {
    const student = req.user;
    const { certificateId } = req.params;

    const certificate = await CourseCertification.findOne({
      certificateId,
      student: student._id,
    }).populate("course");

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    const courseProgress = await CourseProgress.findOne({
      student: student.id,
      course: certificate.course._id,
    });

    if (!courseProgress) {
      return res.status(404).json({
        success: false,
        message: "Course progress not found",
      });
    }

    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      "certificate.html"
    );

    const templateHtml = fs.readFileSync(templatePath, "utf-8");
    const template = Handlebars.compile(templateHtml);

    const issueDate = new Date(certificate.issueDate).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    const completionDate = new Date(
      certificate.courseCompletionDate
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const certificateData = {
      learnerName: certificate.learnerName,
      courseName: certificate.courseName,
      instructorName: certificate.instructorName,
      certificateId: certificate.certificateId,
      issueDate,
      completionDate,
      finalScore: certificate.finalQuizScore,
    };

    const html = template(certificateData);

    browser = await puppeteer.launch({
      headless: true,
      executablePath: "/usr/bin/chromium-browser",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setContent(html);

    await page.evaluate(() => document.fonts.ready);

    // Generate PDF with standard settings
    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      scale: 1,
      height: "100%",
      width: "100%",
    });

    await browser.close();
    browser = null;

    // Set proper headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="certificate-${certificateId}.pdf"`
    );

    // Send buffer directly
    return res.end(pdfBuffer);
  } catch (error) {
    console.error("Certificate generation error:", error);

    // Always close browser if it exists
    if (browser) {
      await browser.close().catch(console.error);
    }

    return res.status(500).json({
      success: false,
      message: "Failed to generate certificate: " + error.message,
    });
  }
}

module.exports = {
  downloadCertificate,
};
