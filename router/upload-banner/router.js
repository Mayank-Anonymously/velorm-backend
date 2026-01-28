const express = require("express");
const uploadbanner = require("../../multer/upload-image/mediumsize");
const {
  uploadbannercontroller,
  GetAllBanners,
  GetAllBannersForAdmin,
  deleteBannerById,
  UpdateBannerById,
  updateBannerStatus
} = require("../../controller/upload-banner/contoller");

const imagerouter = express.Router();

imagerouter.post("/upload-banner-image", uploadbanner, uploadbannercontroller);
imagerouter.get("/get-all-banners-for-admin",GetAllBannersForAdmin);
imagerouter.get("/get-all-banners",GetAllBanners);
imagerouter.get("/delete-banner-by-id/:_id",deleteBannerById);
imagerouter.patch("/update-banner-by-id/:_id",uploadbanner,UpdateBannerById);
imagerouter.patch("/update-banner-status/:_id",updateBannerStatus);

module.exports = imagerouter;
