const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure 'images' folder exists
const uploadDir = "images";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "images"); 
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});

const uploadTrailImageicon = multer({
    storage: storage,
}).single("image"); // Ensure field name is "trial"

module.exports = uploadTrailImageicon;