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

const uploadlargesize = multer({
  storage: storage,
}).single("largesize");
module.exports = uploadlargesize;
