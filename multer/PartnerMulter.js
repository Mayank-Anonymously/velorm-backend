const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "images");
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

const uploadPartnerDoc = multer({
  storage: storage,
}).single("document");
module.exports = uploadPartnerDoc;
