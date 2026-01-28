const express = require("express");
const {
  authlogin,
  userlogin,
  editUserDetails,
  GenerateOTP,
  GenerateOTPWithContact,
  RechargeWallet,
  UpdateBalanceForWalletById,
  getPayIdByOrderId,
  userbyid,
  ReduceBalanceFromWallet,
  GetAllAppUser,
  updateUserWallet,
  userRecharge,
  checkRechargeValidity,
  getLastRecharge,
  getAllUsersForUpdation,
  rechargeUserWallet,
  getManualRecharge,
  ValidateTransaction
} = require("../../controller/Authentication/controller");
const userrouter = express.Router();

userrouter.post("/authenticate", userlogin);
userrouter.post("/add-user-details", authlogin);
userrouter.post("/edit-user-details/:user_id", editUserDetails);
userrouter.post("/otp-by-contact", GenerateOTPWithContact);
userrouter.post("/recharge-wallet/:id", RechargeWallet);
userrouter.get("/payment-id-by-order/:orderId", getPayIdByOrderId);
userrouter.patch("/update-wallet-by-id/:_id", UpdateBalanceForWalletById);
userrouter.get("/user-by-id/:_id", userbyid);
userrouter.put("/update-wallet-by-id/:_id", ReduceBalanceFromWallet);
userrouter.get("/get-all-app-user", GetAllAppUser);
userrouter.post("/update-user-wallet/:user_id",updateUserWallet);
userrouter.post("/user-recharge/:id",userRecharge);
userrouter.get("/check-recharge-validity/:id",checkRechargeValidity);
userrouter.get("/get-last-recharge/:id",getLastRecharge);
userrouter.get("/get-user-data-by-id",getAllUsersForUpdation);
userrouter.post("/update-user-wallet",rechargeUserWallet);
userrouter.get("/get-manual-recharge-data",getManualRecharge);
userrouter.get("/validate-transaction/:transactionId",ValidateTransaction);

module.exports = userrouter;
