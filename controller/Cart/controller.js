const { ObjectId } = require("mongodb");
const cartinstance = require("../../model/cart");
const productinstance = require("../../model/products");
const subscriptioninstance = require("../../model/subscription");
const mongoose = require("mongoose");

const AddProductToCart = async (req, res) => {
  const { productId, userId } = req.params;
  const { inc, dec, subscription_active, productwithdates } = req.body;

  const existingItems = await cartinstance.find({
    user: new ObjectId(userId),
    "cartProduct.subscription_active": true,
  });

  if (existingItems.length !== 0) {
    // If there are existing items with subscription_active as false, delete them
    await cartinstance.deleteMany({
      user: userId,
      "cartProduct.subscription_active": true,
    });
  }

  try {
    let product = {};

    // Check if the product already exists in the cart
    const existingCartItem = await cartinstance.findOne({
      user: new ObjectId(userId),
      "cartProduct._id": new ObjectId(productId),
    });

    if (!existingCartItem) {
      // Product does not exist in the cart, add it
      product = await productinstance.findOneAndUpdate(
        { _id: new ObjectId(productId) },
        {
          $set: {
            selQty: 1,
            subscribed_type: productwithdates.subscribed_type,
            start_date: productwithdates.start_date,
            membership_offer: productwithdates.membership_offer,
            regularPrice: productwithdates.regularPrice,
            subscription_dates: productwithdates.subscription_dates || "",
          },
        },
        { new: true }
      );

      const prodtocart = new cartinstance({
        cartProduct: product,
        user: new ObjectId(userId),
      });

      await prodtocart.save();
    }

    // Increment or decrement the product quantity based on user action
    if (inc) {
      await cartinstance.updateOne(
        {
          user: new ObjectId(userId),
          "cartProduct._id": new ObjectId(productId),
        },
        { $inc: { "cartProduct.$.selQty": 1 } }
      );
    } else if (dec) {
      await cartinstance.deleteOne({
        user: new ObjectId(userId),
        "cartProduct._id": new ObjectId(productId),
        "cartProduct.selQty": 1, // Additional condition to ensure selQty is zero
      });
      await cartinstance.findOneAndUpdate(
        {
          user: new ObjectId(userId),
          "cartProduct._id": new ObjectId(productId),
        },
        { $inc: { "cartProduct.$.selQty": -1 } }
      );

      // Check if selQty is zero after decrementing, then delete the product
    }

    res.status(200).json({
      baseResponse: {
        message: inc ? "Updated" : "Updated Decrement",
        status: 1,
      },
      response: await cartinstance.findOne({
        user: new ObjectId(userId),
        "cartProduct._id": new ObjectId(productId),
      }),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const AddSubScriptionProductToCart = async (req, res) => {
  const { productId, userId } = req.params;
  const { inc, dec, subscription_active, productwithdates } = req.body;
  let response = {};
  try {
    if (inc) {
      response = await subscriptioninstance.findOneAndUpdate(
        {
          user: new ObjectId(userId),
          "subscriptionProduct._id": new ObjectId(productId),
        },
        { $inc: { "subscriptionProduct.$.selQty": 1 } },
        {new:true}
      );
    } else if (dec) {
      const subsciptiondata = await subscriptioninstance.findOne({
        user: new ObjectId(userId)
      });
      const productData = subsciptiondata.subscriptionProduct.find((prod) => {
        return prod._id.toString() === productId.toString()
      })
      if (productData.selQty == 1) {
        response = await subscriptioninstance.findOneAndUpdate(
          {
            user: new ObjectId(userId),
            "subscriptionProduct._id": new ObjectId(productId)
          },
          {
            $pull: {
              subscriptionProduct: {
                _id: new ObjectId(productId)
              }
            }
          },
          {new:true}
        );
      }
      else {
        response = await subscriptioninstance.findOneAndUpdate(
          {
            user: new ObjectId(userId),
            "subscriptionProduct._id": new ObjectId(productId)
          },
          {
            $inc: { "subscriptionProduct.$.selQty": -1 }
          },
          {new:true}
        );
      }
    } else {
      // Check if the product already exists in the subscription
      const existingSubsciptionProduct = await subscriptioninstance.findOne({
        user: new ObjectId(userId),
        "subscriptionProduct._id": new ObjectId(productId),
        subscriptionProduct: {
          $elemMatch: {
            _id: new ObjectId(productId)
          }
        }
      });
      if (existingSubsciptionProduct) {
        return res.status(200).json({
          baseResponse: {
            message: "Product already exists in the subscription",
            status: 1,
          }
        });
      }
      let product = await productinstance.findOneAndUpdate(
        { _id: new ObjectId(productId) },
        {
          $set: {
            selQty: 1,
            subscribed_type: productwithdates.subscribed_type,
            start_date: productwithdates.start_date,
            membership_offer: productwithdates.membership_offer,
            regularPrice: productwithdates.regularPrice,
            subscription_dates: productwithdates.subscription_dates || "",
          },
        },
        { new: true }
      );

      const existingUserSubscription = await subscriptioninstance.findOne({
        user: new ObjectId(userId)
      });
      if (existingUserSubscription) {
        response = await subscriptioninstance.findOneAndUpdate(
          { user: new ObjectId(userId) },
          { $push: { subscriptionProduct: product } },
          { new: true }
        );
      }
      else {
        response = await subscriptioninstance.create({
          subscriptionProduct: product,
          user: new ObjectId(userId),
        })
      }

    }
    // Increment or decrement the product quantity based on user action
    res.status(200).json({
      baseResponse: {
        message: inc ? "Updated" : "Updated Decrement",
        status: 1,
      },
      response: response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const GetAllCartData = async (req, res) => {
  const { userId } = req.params;
  try {
    const FindAll = await cartinstance.find({});

    if (FindAll.length !== null) {
      res.status(200).json({
        baseResponse: { message: "Products Fetched", status: 0 },
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
const GetAllSubscriptionData = async (req, res) => {
  const { userId } = req.params;
  try {
    const FindAll = await subscriptioninstance.find({ user: userId });

    var subscriptiondata = [];
    FindAll.forEach((element) => {
      subscriptiondata.push(...element.subscriptionProduct);
    });
    // const FindAll = await FindAllcartinstance.find({});
    if (FindAll.length !== null) {
      res.status(200).json({
        baseResponse: { message: "Products Fetched", status: 1 },
        response: subscriptiondata,
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

const GetCartDataByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const FindAll = await cartinstance.find({ user: userId });
    var cartData = [];
    FindAll.forEach((element) => {
      cartData.push(...element.cartProduct);
    });
    // const FindAll = await FindAllcartinstance.find({});
    if (FindAll.length !== null) {
      res.status(200).json({
        baseResponse: { message: "Products Fetched", status: 1 },
        response: cartData,
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
    const FindAll = await cartinstance.find({ p_id: p_id });

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
    const FindOne = await cartinstance.findOne({ _id });
    if (FindOne.length !== 0) {
      res.status(200).json({
        baseResponse: { message: "Product Fetched By Id", status: 1 },
        response: FindOne,
      });
    } else {
      res.status(400).json({ message: "Bad Request", status: 0 });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, status: 0 });
  }
};

const EditProductById = async (req, res) => {
  const { _id } = req.params;
  try {
    const { categoryName, status } = req.body;

    const ifExist = await cartinstance.findOneAndUpdate(
      { _id: _id },
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
const UpdateProductQtyById = async (req, res) => {
  const { p_id, value } = req.params;
  try {
    const { categoryName, status } = req.body;

    const ifExist = await cartinstance.findOneAndUpdate(
      { p_id: p_id },
      {
        $set: {
          selQty: value,
        },
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

const DeleteProductById = async (req, res) => {
  const { p_id } = req.params;
  try {
    const { p_id } = req.params;

    const ifExist = await cartinstance.deleteOne({ p_id: p_id });

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

const DeleteAllProduct = async (req, res) => {
  try {
    const ifExist = await cartinstance.deleteMany({});

    if (ifExist) {
      res.status(200).json({
        baseResponse: {
          message: "Cart has been successfully updated",
          status: 1,
        },
      });
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
    const ifExist = await cartinstance.find({ subCategoryId: id });
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


const DeleteToCart = async (req, res) => {
  const { product_id,user_id } = req.params;
  console.log(product_id,user_id,"debgf")
  try {
    if (!product_id || !user_id) {
      return res.status(400).json({
        baseResponse: { message: "Invalid product ID or user ID", status: 0 },
      });
    }
    const deletedCart = await cartinstance.findOneAndDelete({
      user: user_id,
      cartProduct: { $elemMatch: { _id: new ObjectId(product_id) } },
    });

    if (deletedCart) {
      return res.status(200).json({
        baseResponse: { message: "Deleted Successfully", status: 1 },
        response: deletedCart,
      });
    } else {
      return res.status(404).json({
        baseResponse: { message: "Cart item not found", status: 0 },
      });
    }
  } catch (error) {
    res.status(500).json({ message: error, status: 0 });
  }
};


module.exports = {
  AddProductToCart,
  GetAllCartData,
  EditProductById,
  DeleteProductById,
  GetAllProdductById,
  GetSingleProductById,
  GetProductBySubCategoryId,
  UpdateProductQtyById,
  GetCartDataByUser,
  AddSubScriptionProductToCart,
  DeleteAllProduct,
  GetAllSubscriptionData,
  DeleteToCart
};
