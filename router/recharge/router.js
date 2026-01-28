const express = require("express");
const {
  CreateRechargeOffer,
  GetAllOffer,
  updatebyid,
} = require("../../controller/recharge/controller");
const rechargerouter = express.Router();

rechargerouter.post("/create-recharge-offer", CreateRechargeOffer);
rechargerouter.get("/get-all-offer", GetAllOffer);
rechargerouter.patch("/update-offer/:id", updatebyid);

module.exports = rechargerouter;
