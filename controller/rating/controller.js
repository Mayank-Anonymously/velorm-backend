const mongoose = require("mongoose");
const ratinginstance = require("../../model/rating");

const addRating = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { user_id,order_id,rating, description, saveInfo } = req.body;
    const exists_rating = await ratinginstance.findOne({ user_id: user_id,order_id:order_id,product_id: product_id});
    if(exists_rating){
      const data = await ratinginstance.findOneAndUpdate({ user_id: user_id,order_id:order_id,product_id: product_id},{rating,description,saveInfo});
      return res.status(200).json({
        baseResponse: {
          message: "Rating update successfully",
          status: 1,
        },
        response: data
      });
    }
    const data = {
      user_id: user_id,
      order_id:order_id,
      product_id: product_id,
      rating: rating,
      description: description,
      saveInfo: saveInfo
    }
    const ratedData = await ratinginstance.create(data);
    if (ratedData) {
      res.status(200).json({
        baseResponse: {
          message: "Rating added successfully",
          status: 1,
        },
        response: ratedData
      });
    } else {
      res.status(500).json({
        baseResponse: {
          message: "Something went wrong",
          status: 0,
        }
      });
    }
  } catch (error) {
    res.status(500).json({ baseResponse: { message: error.message, status: 0 } });
  }
};

const getAllRating = async (req, res) => {
  try {
    const { product_id } = req.params;
    const ratings = await ratinginstance.aggregate([
      {
        $match: {
          product_id: new mongoose.Types.ObjectId(product_id)
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
          pipeline: [
            {
              $project: {
                name: 1
              }
            }
          ]
        }
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true
        }
      }
    ]);
    res.status(200).json({
      baseResponse: {
        message: "Ratings fetch successfully",
        status: 1,
      },
      response: ratings
    });
  } catch (error) {
    res.status(500).json({ baseResponse: { message: error.message, status: 0 } });
  }
};

const getAllRatingForAdmin = async (req, res) => {
  try {
    const ratings = await ratinginstance.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
          pipeline: [
            {
              $project: {
                name: 1
              }
            }
          ]
        }
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "product",
          pipeline: [
            {
              $project: {
                name: 1
              }
            }
          ]
        }
      },
      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort:{
          _id:-1
        }
      }
    ]);
    res.status(200).json({
      baseResponse: {
        message: "Ratings fetch successfully",
        status: 1,
      },
      response: ratings
    });
  } catch (error) {
    res.status(500).json({ baseResponse: { message: error.message, status: 0 } });
  }
};

const deleteRating = async(req,res)=>{
  try {
    const rating = await ratinginstance.findOneAndDelete({_id:req.params.rating_id});
    if(rating){
      res.status(200).json({
        baseResponse: {
          message: "Review deleted successfully",
          status: 1,
        },
        response: rating
      });
    }else{
      res.status(200).json({
        baseResponse: {
          message: "Review can't delete",
          status: 0,
        }
      });
    }
  } catch (error) {
    res.status(500).json({ baseResponse: { message: error.message, status: 0 } });
  }
}


module.exports = {
  addRating,
  getAllRating,
  getAllRatingForAdmin,
  deleteRating
};
