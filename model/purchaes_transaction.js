const mongoose = require("mongoose");

const purchaestransaction = new mongoose.Schema(
  {
    purchaes_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Purchase", 
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
    remark:{
      type:String
    }
  },
  {
    timestamps: true,
    versionKey:false 
  }
);

const purchaestransactioninstance = new mongoose.model("Purchaestransaction", purchaestransaction);
module.exports = purchaestransactioninstance;
