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

const uploadbanner = multer({
  storage: storage,
}).single("upload",1);
module.exports = uploadbanner;
