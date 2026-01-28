const express = require("express");
const {
  AddProducts,
  AddProductToCart,
  GetAllCartData,
  GetCartDataByUser,
  AddSubScriptionProductToCart,
  DeleteAllProduct,
  GetAllSubscriptionData,
  DeleteToCart
} = require("../../controller/Cart/controller");

const cartrouter = express.Router();

cartrouter.post("/add-to-cart/:productId/:userId", AddProductToCart);
cartrouter.get("/get-all-cart-items", GetAllCartData);
cartrouter.get("/get-cart-by-user/:userId", GetCartDataByUser);
cartrouter.get("/get-subscription-by-user/:userId", GetAllSubscriptionData);
cartrouter.get("/delete-to-cart/:product_id/:user_id",DeleteToCart);
cartrouter.post(
  "/add-subscrption-products/:productId/:userId",
  AddSubScriptionProductToCart
);
cartrouter.post("/empty-cart", DeleteAllProduct);


module.exports = cartrouter;
