const mongoose = require("mongoose");
const users = new mongoose.Schema(
  {
    name: String,
    contact: Number,
    email: String,
    otp: String,
    dob: String,
    walletBalance: Number,
    membership_active: Boolean,
    membership_plan_value: String,
    membership_plan_discount: String,
    membership_subscription: String,
    membershipValidity: String,
    membership_thirtieth_date: String,
    address: Object,
    more_address: Array,
    bottleDelivered: Number,
    bottlePending: Number,
    referral_code:String
  },
  { timestamps: true }
);

const userinstance = new mongoose.model("users", users);
module.exports = userinstance;
