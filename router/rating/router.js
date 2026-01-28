const express = require("express");
const {
    addRating,
    getAllRating,
    getAllRatingForAdmin,
    deleteRating
} = require("../../controller/rating/controller");
const ratingrouter = express.Router();
ratingrouter.post("/add-rating/:product_id",addRating);
ratingrouter.get("/get-all-rating/:product_id",getAllRating);
ratingrouter.get("/get-all-rating-for-admin",getAllRatingForAdmin);
ratingrouter.get("/delete-rating/:rating_id",deleteRating);

module.exports = ratingrouter;
