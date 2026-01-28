const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");

const bannerSchema = new mongoose.Schema(
  {
    image:String,
    status:{
      type:Boolean,
      default:true
    }
  },

  { timestamps: true }
);

autoIncrement.initialize(mongoose.connection);
const bannerinstance = new mongoose.model("Banner", bannerSchema);
module.exports = bannerinstance;
