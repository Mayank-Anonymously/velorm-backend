const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    total_sale: Number,
    total_amount: Number,
    total_refund: Number,
    offer_balance: Number,
    add_purchase: Number,
    add_expense: Number,
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vendor",
    },
    product_name: String,
    product_qty: Number,
    product_price: Number,
    bill_no: String,
    bill_date: String,
    sgst: Number,
    cgst: Number,
    igst: Number,
    total_amount_without_tax: Number,
    total_amount_with_tax: Number,
    amount_given:{
      type:Number,
      default:0
    },
    status:{
      type:String,
      enum:["pending","success"],
      default:"pending"
    }
  },
  { timestamps: true }
);

const Purchase = mongoose.model("Purchase", purchaseSchema);
module.exports = Purchase;
