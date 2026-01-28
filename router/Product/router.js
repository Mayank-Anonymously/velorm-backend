const express = require("express");
const uploadProductImage = require("../../multer/productMulter");
const {
  AddProducts,
  GetAllProductsForAdmin,
  GetAllProducts,
  GetProductBySubCategoryId,
  GetSingleProductById,
  GetProductsBySubId,
  SingleProductUpload,
  UpdateProductById,
  UpdateProductStatusById,
} = require("../../controller/Products/controller");
const uploadProductImageicon = require("../../multer/productIconImage");
const productrouter = express.Router();

productrouter.post("/create-product", uploadProductImage, AddProducts);
productrouter.post(
  "/single-image-product",
  uploadProductImageicon,
  SingleProductUpload
);
productrouter.get("/get-all-products-for-admin",GetAllProductsForAdmin);
productrouter.get("/get-all-products", GetAllProducts);
productrouter.get("/get-all-products-by-sub-id/:id", GetProductBySubCategoryId);
productrouter.get("/get-product-by-id/:_id", GetSingleProductById);
productrouter.post("/get-product-by-sub-id", GetProductsBySubId);

productrouter.patch(
  "/update-product-details/:_id",
  uploadProductImage,
  UpdateProductById
);
productrouter.patch("/update-product-status/:_id", UpdateProductStatusById);
// categoryRouter.get(
//   "/get-filtered-category/:c_id",

//   GetAllCatgoriesById

// );
// categoryRouter.get("/create-single-category-by-id/:c_id", GetSingleCatgoryById);

module.exports = productrouter;
