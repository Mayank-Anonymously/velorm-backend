const express = require("express");
const uploadTestimonialImage = require("../../multer/testimonialMulter")
const {
  AddTestimonial,
  GetAllTestimonialForAdmin,
  GetAllTestimonials,
  UpdateTestmonialById,
  UpdateTestimonialStatusById,
  deleteTestimonial
} = require("../../controller/testimonial/controller");
const testimonialrouter = express.Router();

testimonialrouter.post("/create-testimonial", uploadTestimonialImage, AddTestimonial);
testimonialrouter.get("/get-all-testimonial-for-admin",GetAllTestimonialForAdmin);
testimonialrouter.get("/get-all-testimonial", GetAllTestimonials);
testimonialrouter.patch(
  "/edit-testimonial/:_id",
  uploadTestimonialImage,
  UpdateTestmonialById
);
testimonialrouter.patch("/update-testimonial-status/:_id", UpdateTestimonialStatusById);
testimonialrouter.get("/delete-testimonial/:_id",deleteTestimonial);


module.exports = testimonialrouter;
