const express = require("express");
const { UpdateProductStock, UpdateAfterOrder } = require("../../controller/controller");
const router = express.Router();

router.post("/update-qty", UpdateProductStock);
router.post("/update-after-order-qty", UpdateAfterOrder);

module.exports = router;
