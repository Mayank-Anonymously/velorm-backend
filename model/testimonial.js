const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    title:String,
    image:String,
    description:String,
    status:{
        type:Boolean,
        default:true
    }
  },
  { timestamps: true }
);

const testinomialinstance = new mongoose.model("Testimonial", testimonialSchema);

module.exports = testinomialinstance;
