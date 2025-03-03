const express = require("express");

const router = express.Router();

const { auth, student } = require("../middlewares/auth");
const {
  downloadCertificate,
} = require("../controllers/certificate.controller");

router.get(
  "/download-certificate/:certificateId",
  auth,
  student,
  downloadCertificate
);

module.exports = router;
