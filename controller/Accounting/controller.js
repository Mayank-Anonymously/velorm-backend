const orderinstance = require("../../model/order");
const purchaseinstance = require("../../model/purchase")
const expenseinstance = require("../../model/expense");
const purchaestransactioninstance = require("../../model/purchaes_transaction");
const mongoose = require("mongoose")
const totalSaleWithoutVip = async (req, res) => {
    try {
        const totalsalewithoutvip = await orderinstance.aggregate([
            {
                $unwind: {
                    path: "$product",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    "product.subscription_active": false
                }
            },
            {
                $group: {
                    _id: "$product.id",
                    product_name: {
                        $first: "$product.name"
                    },
                    quantity: {
                        $sum: "$product.selQty"
                    },
                    price: {
                        $first: "$product.price"
                    },
                    sgst: {
                        $first: "$product.sgst"
                    },
                    cgst: {
                        $first: "$product.cgst"
                    },
                    igst: {
                        $first: "$product.igst"
                    }
                }
            },
            {
                $project: {
                    product_name: 1,
                    quantity: 1,
                    price: 1,
                    total_amount_without_tax: {
                        $add: {
                            $multiply: ["$quantity", "$price"]
                        }
                    },
                    sgst: 1,
                    cgst: 1,
                    igst: 1,
                    total_tax: {
                        $add: [
                            {
                                $ifNull: ["$sgst", 0]
                            },
                            {
                                $ifNull: ["$cgst", 0]
                            },
                            {
                                $ifNull: ["$igst", 0]
                            }
                        ]
                    },
                    total_amount_with_tax: {
                        $add: [
                            {
                                $multiply: ["$quantity", "$price"]
                            },
                            {
                                $ifNull: ["$sgst", 0]
                            },
                            {
                                $ifNull: ["$cgst", 0]
                            },
                            {
                                $ifNull: ["$igst", 0]
                            }
                        ]
                    }
                }
            }
        ])
        res.status(200).json({
            baseResponse: {
                status: 1,
                message: "Total sale without vip fetch Successfully",
            },
            response: totalsalewithoutvip,
        });
    } catch (error) {
        res.status(500).json({
            baseresponse: { message: "Internal Server Error", status: 0 },
        });
    }
};

const totalSaleWithVip = async (req, res) => {
    try {
        const totalsalewithvip = await orderinstance.aggregate([
            {
                $unwind: {
                    path: "$product",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    "product.subscription_active": true
                }
            },
            {
                $group: {
                    _id: "$product.id",
                    product_name: {
                        $first: "$product.name"
                    },
                    quantity: {
                        $sum: "$product.selQty"
                    },
                    price: {
                        $first: "$product.price"
                    },
                    sgst: {
                        $first: "$product.sgst"
                    },
                    cgst: {
                        $first: "$product.cgst"
                    },
                    igst: {
                        $first: "$product.igst"
                    }
                }
            },
            {
                $project: {
                    product_name: 1,
                    quantity: 1,
                    price: 1,
                    total_amount_without_tax: {
                        $add: {
                            $multiply: ["$quantity", "$price"]
                        }
                    },
                    sgst: 1,
                    cgst: 1,
                    igst: 1,
                    total_tax: {
                        $add: [
                            {
                                $ifNull: ["$sgst", 0]
                            },
                            {
                                $ifNull: ["$cgst", 0]
                            },
                            {
                                $ifNull: ["$igst", 0]
                            }
                        ]
                    },
                    total_amount_with_tax: {
                        $add: [
                            {
                                $multiply: ["$quantity", "$price"]
                            },
                            {
                                $ifNull: ["$sgst", 0]
                            },
                            {
                                $ifNull: ["$cgst", 0]
                            },
                            {
                                $ifNull: ["$igst", 0]
                            }
                        ]
                    }
                }
            }
        ])
        res.status(200).json({
            baseResponse: {
                status: 1,
                message: "Total sale without vip fetch Successfully",
            },
            response: totalsalewithvip,
        });
    } catch (error) {
        res.status(500).json({
            baseresponse: { message: "Internal Server Error", status: 0 },
        });
    }
};

const totalOfferBalanceByCompany = async (req, res) => {
    try {
        const totalofferbalancebycompany = await orderinstance.aggregate()
        res.status(200).json({
            baseResponse: {
                status: 1,
                message: "Total offer balance by company fetch Successfully",
            },
            response: totalofferbalancebycompany,
        });
    } catch (error) {
        res.status(500).json({
            baseresponse: { message: "Internal Server Error", status: 0 },
        });
    }
};

const totalAmountReceivedByCompany = async (req, res) => {
    try {
        const { start_date, end_date } = req.body;
        let pipeline = [];
        if (start_date && end_date) {
            pipeline.push({
                $match: {
                    // createdAt: {
                    //     $gte: ISODate("2024-07-01T00:00:00Z"),
                    //     $lte: ISODate("2024-07-16T23:59:59Z")
                    // }
                    createdAt: {
                        $gte: ISODate(start_date),
                        $lte: ISODate(end_date)
                    }
                }
            })
        }
        pipeline.push({
            $group: {
              _id: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt"
                  }
                },
                paymentOption: "$paymentOption"
              },
              total_amount: {
                $sum: "$amount"
              },
              count: {
                $sum: 1
              }
            }
          },
          {
            $group: {
              _id: "$_id.date",
              counts: {
                $push: {
                  paymentOption: "$_id.paymentOption",
                  count: "$count",
                  total_amount: "$total_amount"
                }
              }
            }
          },
          {
            $lookup: {
              from: "orders",
              // replace with your actual collection name
              let: {
                date: "$_id"
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: [
                            {
                              $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt"
                              }
                            },
                            "$$date"
                          ]
                        },
                        {
                          $eq: [
                            "$paymentOption",
                            "Online pay"
                          ]
                        },
                        {
                          $eq: [
                            "$user.membership_active",
                            true
                          ]
                        }
                      ]
                    }
                  }
                },
                {
                  $group: {
                    _id: null,
                    total_amount: {
                      $sum: "$amount"
                    }
                  }
                },
                {
                  $project: {
                    _id: 0,
                    total_amount: 1
                  }
                }
              ],
              as: "membershipOnlineSales"
            }
          },
          {
            $unwind: {
              path: "$membershipOnlineSales",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $project: {
              _id: 0,
              date: "$_id",
              wallet: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$counts",
                      as: "item",
                      cond: {
                        $eq: [
                          "$$item.paymentOption",
                          "Wallet"
                        ]
                      }
                    }
                  },
                  0
                ]
              },
              online: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$counts",
                      as: "item",
                      cond: {
                        $eq: [
                          "$$item.paymentOption",
                          "Online pay"
                        ]
                      }
                    }
                  },
                  0
                ]
              },
              cashOnDelivery: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$counts",
                      as: "item",
                      cond: {
                        $eq: [
                          "$$item.paymentOption",
                          "Cash on delivery"
                        ]
                      }
                    }
                  },
                  0
                ]
              },
              membershipOnlineSales: {
                $ifNull: [
                  "$membershipOnlineSales.total_amount",
                  0
                ]
              }
            }
          },
          {
            $project: {
              date: 1,
              wallet: {
                $ifNull: [
                  {
                    $round: [
                      {
                        $ifNull: [
                          "$wallet.total_amount",
                          0
                        ]
                      },
                      2
                    ]
                  },
                  0
                ]
              },
              online: {
                $ifNull: [
                  {
                    $round: [
                      {
                        $ifNull: [
                          "$online.total_amount",
                          0
                        ]
                      },
                      2
                    ]
                  },
                  0
                ]
              },
              cashOnDelivery: {
                $ifNull: [
                  {
                    $round: [
                      {
                        $ifNull: [
                          "$cashOnDelivery.total_amount",
                          0
                        ]
                      },
                      2
                    ]
                  },
                  0
                ]
              },
              membershipOnlineSales: {
                $round: ["$membershipOnlineSales", 2]
              }
            }
          },
          {
            $sort: {
              date: 1
            }
          })
            const data = await orderinstance.aggregate(pipeline);
            res.status(200).json({
                baseResponse: {
                    status: 1,
                    message: "Total amount received by company fetch successfully",
                },
                response:data
            });
    } catch (error) {
        res.status(500).json({
            baseresponse: { message: "Internal Server Error", status: 0 },
        });
    }
};

const purchaseByUser = async (req, res) => {
    try {
        console.log(req.body, "Fg");

        const data = new purchaseinstance({
            total_sale: req.body.totalSale,
            total_amount: req.body.totalAmount,
            total_refund: req.body.totalRefund,
            offer_balance: req.body.offerBalance,
            add_purchase: req.body.addPurchase,
            add_expense: req.body.addExpenses,
            vendor: mongoose.Types.ObjectId(req.body.vendor),
            product_name: req.body.productName,
            product_qty: req.body.productQuantity,
            product_price: req.body.productPrice,
            bill_no: req.body.billNo,
            bill_date: req.body.billDate,
            sgst: req.body.sgst,
            cgst: req.body.cgst,
            igst: req.body.igst,
            total_amount_without_tax: req.body.totalAmountWithoutTax,
            total_amount_with_tax: req.body.totalAmountWithTax,
        });

        await data.save();

        res.status(200).json({
            baseResponse: {
                status: 1,
                message: "Purchase created successfully",
            },
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            baseResponse: { message: "Internal Server Error", status: 0 },
        });
    }
};

const getAllPurchaseByUser = async (req, res) => {
    try {
        const purchses = await purchaseinstance.find({}).populate("vendor");
        res.status(200).json({
            baseResponse: {
                status: 1,
                message: "Purchases list fetch successfully",
            },
            response: purchses
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            baseResponse: { message: "Internal Server Error", status: 0 },
        });
    }
};

const expenses = async (req, res) => {
    try {
        console.log(req.body, "Fg");

        const data = new expenseinstance({
            total_sale: req.body.totalSale,
            total_amount: req.body.totalAmount,
            total_refund: req.body.totalRefund,
            offer_balance: req.body.offerBalance,
            add_purchase: req.body.addPurchase,
            add_expense: req.body.addExpenses,
            vendor: mongoose.Types.ObjectId(req.body.vendor),
            product_name: req.body.productName,
            product_qty: req.body.productQuantity,
            product_price: req.body.productPrice,
            bill_no: req.body.billNo,
            bill_date: req.body.billDate,
            sgst: req.body.sgst,
            cgst: req.body.cgst,
            igst: req.body.igst,
            total_amount_without_tax: req.body.totalAmountWithoutTax,
            total_amount_with_tax: req.body.totalAmountWithTax,
        });

        await data.save();

        res.status(200).json({
            baseResponse: {
                status: 1,
                message: "Expense created successfully",
            },
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            baseResponse: { message: "Internal Server Error", status: 0 },
        });
    }
};

const getAllExpenses = async (req, res) => {
    try {
        const expenses = await expenseinstance.find({}).populate("vendor");
        res.status(200).json({
            baseResponse: {
                status: 1,
                message: "Expenses list fetch created successfully",
            },
            response: expenses
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            baseResponse: { message: "Internal Server Error", status: 0 },
        });
    }
};

function generateRefId(length = 10) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let refId = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    refId += characters[randomIndex];
  }
  return refId;
}

const updateGivenAmount = async (req, res) => {
  try {
      console.log(req.params);
      console.log(req.body);
      const purchaes = await purchaseinstance.findOne({_id:req.params.id});
      const remaining_amount = purchaes.total_amount_with_tax - purchaes.amount_given;
      if(remaining_amount<req.body.paymentAmount)
      {
        return res.status(200).json({
            baseResponse: {
                status: 0,
                message: "Amount Can't greater than remaining amount",
            }
        });
      }
      const purchaesdata = await purchaseinstance.findByIdAndUpdate(
        {_id:req.params.id},   
        { $inc: { amount_given: req.body.paymentAmount } },   
        { new: true }    
      );
      if(purchaesdata.total_amount_with_tax==purchaesdata.amount_given)
      {
        await purchaseinstance.findByIdAndUpdate(
          {_id:req.params.id},   
          {status:"success"},   
          { new: true }    
        );
      }
      const data = new purchaestransactioninstance({
        purchaes_id:req.params.id,
        ref_id:generateRefId(),
        amount:req.body.paymentAmount,
        payment_status:"success",
        remark:req.body.remark
      })
      await data.save();
      res.status(200).json({
          baseResponse: {
              status: 1,
              message: "Payment update successfully",
          }
      });
  } catch (error) {
      console.log(error)
      res.status(500).json({
          baseResponse: { message: "Internal Server Error", status: 0 },
      });
  }
};


module.exports = {
    totalSaleWithoutVip,
    totalSaleWithVip,
    totalOfferBalanceByCompany,
    totalAmountReceivedByCompany,
    purchaseByUser,
    getAllPurchaseByUser,
    expenses,
    getAllExpenses,
    updateGivenAmount
};