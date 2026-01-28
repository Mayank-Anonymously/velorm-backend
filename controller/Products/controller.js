const { ObjectId } = require("mongodb");
const productinstance = require("../../model/products");
const fs = require("fs");
const mongoose = require("mongoose");

const AddProducts = async (req, res) => {
  try {
    // console.log(req.body, "wegwsdfgh")
    // console.log(req.files,"efg");
    const {
      name,
      categoryId,
      status,
      subCategoryId,
      regularPrice,
      price,
      description,
      location,
      unit,
      unit_value,
      productType,
      subscription_type,
      subscription_active,
      membership_offer,
      shortDescription,
      sgst,
      cgst,
      igst
    } = req.body;

    const newProduct = new productinstance({
      name,
      categoryId,
      status,
      subCategoryId,
      regularPrice,
      price,
      description,
      selQty: 0,
      location: JSON.parse(location),
      unit,
      unit_value: JSON.parse(unit_value),
      productImage: req.files,
      productType,
      subscription_type,
      subscription_active,
      membership_offer,
      shortDescription,
      stock: 0,
      sgst,
      cgst,
      igst
    });
    if (name !== "" && status !== "") {
      await newProduct.save();
      res.status(200).json({
        message: "Created Successfuly",
        status: 1,
        response: newProduct,
      });
    } else {
      res.status(400).json({ message: "Bad Request", status: 0 });
    }
  } catch (error) {
    res.status(500).json({ message: error, status: 0 });
  }
};

const SingleProductUpload = async (req, res) => {
  // try {
  const { id, status } = req.body;
  console.log(id, status, "Dgsdg");
  console.log(req.file, "DF");
  if (req.file) {
    const ifAlradyExist = await productinstance.findOneAndUpdate(
      { _id: id },
      { icon: req.file.filename },
      { return: "after" }
    );
    return res.status(200).json({
      message: "Created Successfuly",
      status: 1,
      response: ifAlradyExist,
    });
  }
  res.status(200).json({
    message: "Created Successfuly",
    status: 1
  });
  // } catch (error) {
  //   res.status(500).json({ message: error, status: 0 });
  // }
};

const GetAllProductsForAdmin = async (req, res) => {
  try {
    const FindAll = await productinstance.find();
    if (FindAll.length !== null) {
      res.status(200).json({
        baseResponse: { message: "Products Fetched", status: 1 },
        response: FindAll,
      });
    } else {
      res.status(400).json({
        baseResponse: { message: "No Products Found", status: 0 },
        response: FindAll,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};

const GetAllProducts = async (req, res) => {
  try {
    const FindAll = await productinstance.aggregate([
      {
        $match: {
          status: true
        }
      },
      {
        $lookup: {
          from: "ratings",
          localField: "_id",
          foreignField: "product_id",
          as: "rating"
        }
      },
      {
        $addFields: {
          totalrating: {
            $size: "$rating"
          }
        }
      },
      {
        $addFields: {
          rating: {
            $cond: {
              if: {
                $gt: [
                  {
                    $size: "$rating"
                  },
                  0
                ]
              },
              then: {
                $avg: "$rating.rating"
              },
              else: 0
            }
          }
        }
      }
    ])
    // const FindAll = await productinstance.find({});
    if (FindAll.length !== null) {
      res.status(200).json({
        baseResponse: { message: "Products Fetched", status: 1 },
        response: FindAll,
      });
    } else {
      res.status(400).json({
        baseResponse: { message: "No Products Found", status: 0 },
        response: FindAll,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};

const GetAllProdductById = async (req, res) => {
  const { p_id } = req.params;
  try {
    const FindAll = await productinstance.find({ p_id: p_id });

    if (FindAll.length !== 0) {
      res.status(200).json({
        baseResponse: { message: "Product Fetched By Id", status: 0 },
        response: FindAll,
      });
    } else {
      res.status(400).json({ message: "Bad Request", status: 0 });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};

const GetSingleProductById = async (req, res) => {
  const { _id } = req.params;
  try {
    const FindOne = await productinstance.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id),
          status: true
        }
      },
      {
        $lookup: {
          from: "ratings",
          localField: "_id",
          foreignField: "product_id",
          as: "rating"
        }
      },
      {
        $addFields: {
          totalrating: {
            $size: "$rating"
          }
        }
      },
      {
        $addFields: {
          rating: {
            $cond: {
              if: {
                $gt: [
                  {
                    $size: "$rating"
                  },
                  0
                ]
              },
              then: {
                $avg: "$rating.rating"
              },
              else: 0
            }
          }
        }
      }
    ]);
    if (FindOne.length !== 0) {
      res.status(200).json({
        baseResponse: { message: "Product Fetched By Id", status: 1 },
        response: FindOne[0],
      });
    } else {
      res.status(400).json({ message: "Bad Request", status: 0 });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};

const EditProductById = async (req, res) => {
  const { p_id } = req.params;
  try {
    const { categoryName, status } = req.body;

    const ifExist = await productinstance.findOneAndUpdate(
      { p_id: p_id },
      {
        categoryName: categoryName,
        status: status,
        categoryImage: req.file.filename,
      }
    );

    if (ifExist) {
      res
        .status(200)
        .json({ baseResponse: { message: "Updated Successfuly", status: 1 } });
    } else {
      res
        .status(400)
        .json({ baseResponse: { message: "Bad Request", status: 0 } });
    }
  } catch (error) {
    res
      .status(500)
      .json({ baseResponse: { message: error.message, status: 0 } });
  }
};

const UpdateProductById = async (req, res) => {
  console.log(req.files, "DFjh");
  console.log(req.body, "qewrtgwgh");

  const { _id } = req.params;
  const {
    name,
    categoryId,
    status,
    subCategoryId,
    regularPrice,
    price,
    description,
    selQty,
    location,
    unit,
    unit_value,
    productType,
    subscription_type,
    subscription_active,
    membership_offer,
    shortDescription,
    sgst,
    cgst,
    igst
  } = req.body;

  try {
    const ifExist = await productinstance.findOneAndUpdate(
      { _id: new ObjectId(_id) },
      {
        $set: {
          name,
          categoryId,
          status,
          subCategoryId,
          regularPrice,
          price,
          description,
          selQty: 0,
          location: JSON.parse(location),
          unit,
          unit_value: JSON.parse(unit_value),
          productImage: req.files, // Assigning file paths to productImages
          productType,
          subscription_type,
          subscription_active,
          membership_offer,
          shortDescription,
          sgst,
          cgst,
          igst
        },
      }
    );

    if (ifExist) {
      // Delete previous images if needed
      // Assuming ifExist.productImages contains the paths of previous images
      // You may want to handle this differently depending on your requirements
      if (ifExist.productImages && ifExist.productImages.length > 0) {
        ifExist.productImages.forEach((imagePath) => {
          fs.unlinkSync(imagePath); // Delete previous image files
        });
      }

      res.status(200).json({
        baseResponse: { message: "Updated Successfully", status: 1 },
        response: ifExist,
      });
    } else {
      res
        .status(400)
        .json({ baseResponse: { message: "Bad Request", status: 0 } });
    }
  } catch (error) {
    res
      .status(500)
      .json({ baseResponse: { message: error.message, status: 0 } });
  }
};

const DeleteProductById = async (req, res) => {
  const { p_id } = req.params;
  try {
    const { p_id } = req.params;

    const ifExist = await productinstance.deleteOne({ p_id: p_id });

    if (ifExist) {
      res
        .status(200)
        .json({ baseResponse: { message: "Deleted Successfuly", status: 1 } });
    } else {
      res
        .status(400)
        .json({ baseResponse: { message: "Bad Request", status: 0 } });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};
const GetProductBySubCategoryId = async (req, res) => {
  const { id } = req.params;
  try {
    const ifExist = await productinstance.find({
      subCategoryId: id,
      status: true,
    });
    console.log(ifExist);
    if (ifExist) {
      res.status(200).json({
        baseResponse: { message: "fetched Successfuly", status: 1 },
        response: ifExist,
      });
    } else {
      res
        .status(400)
        .json({ baseResponse: { message: "Bad Request", status: 0 } });
    }
  } catch (error) {
    res.status(500).json({ message: error, status: 0 });
  }
};

const GetProductsBySubId = async (req, res) => {
  const { pId } = req.body;
  var product = [];
  try {
    // Use map instead of forEach to execute async operations in parallel
    const promises = pId.map(async (element) => {
      var brutalfetch = await productinstance.find({
        subCategoryId: element,
      });
      product.push(...brutalfetch);
    });
    // Wait for all async operations to complete
    await Promise.all(promises);

    res.status(200).json({
      baseResponse: { message: "Product Fetched", status: 1 },
      response: product,
    });
  } catch (error) {
    // Handle error
    console.error(error);
    res.status(500).json({
      baseResponse: { message: "Internal Server Error", status: 0 },
    });
  }
};
const UpdateProductStatusById = async (req, res) => {
  const { _id } = req.params;
  const { status } = req.body;

  try {
    const ifExist = await productinstance.findOneAndUpdate(
      { _id: new ObjectId(_id) },
      {
        $set: {
          status: status,
        },
      }
    );

    if (ifExist) {
      res.status(200).json({
        baseResponse: { message: "Updated Successfully", status: 1 },
        response: ifExist,
      });
    } else {
      res
        .status(400)
        .json({ baseResponse: { message: "Bad Request", status: 0 } });
    }
  } catch (error) {
    res
      .status(500)
      .json({ baseResponse: { message: error.message, status: 0 } });
  }
};

module.exports = {
  AddProducts,
  GetAllProductsForAdmin,
  GetAllProducts,
  EditProductById,
  DeleteProductById,
  GetAllProdductById,
  GetSingleProductById,
  GetProductBySubCategoryId,
  UpdateProductById,
  SingleProductUpload,
  GetProductsBySubId,
  UpdateProductStatusById,
};
