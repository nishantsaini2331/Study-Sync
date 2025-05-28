// const puppeteer = require("puppeteer");
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const CourseCertification = require("../models/certificate.model");
const CourseProgress = require("../models/courseProgress.model");
const QRCode = require("qrcode");
const { FRONTEND_URL, NODE_ENV } = require("../config/dotenv");

async function downloadCertificate(req, res) {
  let browser = null;
  try {
    const student = req.user;
    const { certificateId } = req.params;

    const certificate = await CourseCertification.findOne({
      certificateId,
      student: student._id,
    })
      .populate("course")
      .populate({
        path: "user",
        select: "name -_id",
      });

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

    const logoPath = path.join(__dirname, "..", "templates", "logo.svg");
    const logoBuffer = fs.readFileSync(logoPath);
    const base64Logo = logoBuffer.toString("base64");

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

    const verificationUrl = `${FRONTEND_URL}/verify-certificate/${certificateId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: "M",
      type: "image/png",
      width: 150,
      margin: 1,
      color: {
        dark: "#1a237e",
        light: "#ffffff",
      },
    });

    const certificateData = {
      learnerName: certificate.user.name,
      courseName: certificate.courseName,
      instructorName: certificate.instructorName,
      certificateId: certificate.certificateId,
      issueDate,
      completionDate,
      finalScore: certificate.finalQuizScore,
      qrCodeDataUrl: qrCodeDataUrl,
      logoDataUrl: `data:image/svg+xml;base64,${base64Logo}`,
    };

    const html = template(certificateData);

    browser = await puppeteer.launch({
      headless: true,
      executablePath:
        NODE_ENV === "production"
          ? "/usr/bin/chromium"
          : "/usr/bin/chromium-browser",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setContent(html);

    await page.evaluate(() => document.fonts.ready);

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

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="certificate-${certificateId}.pdf"`
    );

    return res.end(pdfBuffer);
  } catch (error) {
    console.error("Certificate generation error:", error);

    if (browser) {
      await browser.close().catch(console.error);
    }

    return res.status(500).json({
      success: false,
      message: "Failed to generate certificate: " + error.message,
    });
  }
}

async function verifyCertificate(req, res) {
  try {
    const { certificateId } = req.params;

    const certificate = await CourseCertification.findOne({
      certificateId,
      //   student: student._id,
    })
      .populate("course")
      .populate({
        path: "user",
        select: "name -_id",
      });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }
    
    const certificateData = {
      learnerName: certificate.user.name,
      courseName: certificate.courseName,
      instructorName: certificate.instructorName,
      certificateId: certificate.certificateId,
      issueDate: certificate.issueDate,
      finalQuizScore: certificate.finalQuizScore,
      courseCompletionDate: certificate.courseCompletionDate,
    };
    return res.status(200).json({
      success: true,
      data: certificateData,
    });
  } catch (error) {
    console.error("Certificate verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify certificate: " + error.message,
    });
  }
}

module.exports = {
  downloadCertificate,
  verifyCertificate,
};
