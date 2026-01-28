const { ObjectId } = require("mongodb");
const productinstance = require("../model/products");

const UpdateProductStock = async (req, res) => {
  const { productId, qty } = req.body;
  try {
    const findProduct = await productinstance.findOne({
      _id: productId,
    });

    if (
      (findProduct !== null && findProduct.stock > 0) ||
      findProduct.stock > "0"
    ) {
      res.status(200).json({
        baseResponse: {
          message: "Found Product",
          status: 1,
        },
        response: await productinstance.findOneAndUpdate(
          {
            _id: productId,
          },
          {
            $set: {
              stock: JSON.parse(findProduct.stock) + qty,
            },
          },
          {
            returnDocument: "after",
          }
        ),
      });
    } else if (
      (findProduct !== null && findProduct.stock === 0) ||
      findProduct.stock === "0"
    ) {
      res.status(200).json({
        baseResponse: {
          message: "Found Product Updated",
          status: 1,
        },
        response: await productinstance.findOneAndUpdate(
          {
            _id: productId,
          },
          {
            $set: {
              stock: qty,
            },
          },
          {
            returnDocument: "after",
          }
        ),
      });
    } else {
      res.status(200).json({
        baseResponse: {
          message: "Something went wrong",
          status: 0,
        },
        response: [],
      });
    }
  } catch (error) {
    res.status(200).json({
      baseResponse: {
        message: error,
        status: 0,
      },
      response: [],
    });
  }
};

const UpdateAfterOrder = async (req, res) => {
  const { productId,qty } = req.body;

  try {
    const findProduct = await productinstance.findOne({
      _id: productId,
    });

    if (findProduct !== null) {
      if (findProduct.stock > 0) {
        let oldstock = findProduct.stock;
        let currentstock = oldstock-qty;
        await productinstance.findOneAndUpdate(
          { _id: productId },
          { stock: currentstock},
          { returnDocument: "after" }
        );

        res.status(200).json({
          baseResponse: {
            message: "Product found and updated",
            status: 1,
          },
        });
      } else {
        res.status(200).json({
          baseResponse: {
            message: "Product out of stock",
            status: 0,
          },
        });
      }
    } else {
      res.status(200).json({
        baseResponse: {
          message: "Product not found",
          status: 0,
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      baseResponse: {
        message: "Internal server error",
        status: 0,
      },
    });
  }
};

module.exports = { UpdateProductStock, UpdateAfterOrder };
