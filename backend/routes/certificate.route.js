const express = require("express");

const router = express.Router();

const { auth, student } = require("../middlewares/auth");
const {
  downloadCertificate,
  verifyCertificate
} = require("../controllers/certificate.controller");

router.get(
  "/download-certificate/:certificateId",
  auth,
  student,
  downloadCertificate
);

router.get(
  "/verify-certificate/:certificateId",
  verifyCertificate
);

module.exports = router;
