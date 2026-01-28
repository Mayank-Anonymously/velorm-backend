const express = require("express");
const {
  FetchSubscriptionByUser,
  SaveNewAddress,
  FetchOrderByUser,
  GetNewAddress,
  checkSubscriptionofUser,
  editUserAddress
} = require("../../controller/user/controller");
const userdetailsrouter = express.Router();

userdetailsrouter.get(
  "/get-subscription-by-user/:userId",
  FetchSubscriptionByUser
);
userdetailsrouter.get("/get-order-by-user/:userId", FetchOrderByUser);
userdetailsrouter.get("/get-current-user-address/:userId", GetNewAddress);
userdetailsrouter.post("/save-new-address/:userId", SaveNewAddress);
userdetailsrouter.post("/edit-user-address/:address_id",editUserAddress);
userdetailsrouter.get("/check-subscription/:userId", checkSubscriptionofUser);

module.exports = userdetailsrouter;
