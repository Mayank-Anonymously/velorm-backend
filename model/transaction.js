const mongoose = require("mongoose");

const transaction = new mongoose.Schema(
  {
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users", 
    },
    transaction_type:{
        type:String,
        enum:["Cr","Dr"]
    },
    ref_id:{
      type:String
    },
    amount:{
      type:Number
    },
    payment_status:{
      type:String
    },
    message:{
      type:String
    }
  },
  {
    timestamps: true,
    versionKey:false 
  }
);

const transactioninstance = new mongoose.model("Transaction", transaction);
module.exports = transactioninstance;
