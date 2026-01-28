const mongoose = require("mongoose");

const partner = new mongoose.Schema(
  {
    city: Object,
    hub: Object,
    name: String,
    contact: String,
    document: String,
    address: String,
    email: String,
    otp: Number || String,
    given_amount:{
      type:Number,
      default:0
    }
  },

  { timestamps: true }
);

const partnerinstanceapp = new mongoose.model("partners", partner);
module.exports = partnerinstanceapp;
