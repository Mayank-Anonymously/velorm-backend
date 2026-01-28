const express = require("express");
const uploadbanner = require("../../multer/upload-image/mediumsize");
const {
    uploadslidercontroller,
    GetAllSlidersForAdmin,
    GetAllSliders,
    deleteSliderById,
    UpdateSliderById,
    updateSliderStatus
} = require("../../controller/silder/controller");

const sliderrouter = express.Router();

sliderrouter.post("/upload-slider-image", uploadbanner, uploadslidercontroller);
sliderrouter.get("/get-all-sliders-for-admin",GetAllSlidersForAdmin);
sliderrouter.get("/get-all-sliders",GetAllSliders);
sliderrouter.get("/delete-slider-by-id/:_id",deleteSliderById);
sliderrouter.patch("/update-slider-by-id/:_id",uploadbanner,UpdateSliderById);
sliderrouter.patch("/update-slider-status/:_id",updateSliderStatus);

module.exports = sliderrouter;
