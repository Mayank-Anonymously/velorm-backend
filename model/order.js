const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const orderProduct = require("./orderSchemas/orderProduct");
const shippingaddress = require("./orderSchemas/orderShipping");
const mongooseserial = require("mongoose-serial");
const userinstance = require("./user");

const order = new mongoose.Schema(
  {
    order_no: String,
    status: {
      type: String,
      enum: [
        "DELIVERED",
        "ORDERED",
        "ONTHEEWAY",
        "PROCCESSING",
        "FAILED",
        "DECLINED",
        "SUBSCRIBED",
        "NEXTDAYDELIVERY",
        "ASSIGNED",
        "CANCELLEDBYPARTNER",
        "CANCELLEDBYADMIN",
        "CANCELLEDBYCUSTOMER",
      ],
      required: true,
    },
    // currentStatus: String,
    nextDate: String,
    orderPlace: String,
    product: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products"
        },
        name: String,
        image:Array,
        quantity:Number,
        price:Number,
        unitValue:Number,
        unit:String,
        subscription_type:Array,
        start_date:String,
        subscription_dates:Array,
        selQty:Number,
        membership_offer: String,
        regularPrice: Number,
        subscription_active: Boolean,
        icon: String,
        sgst:Number,
        cgst:Number,
        igst:Number
      }
    ],
    shippingaddress: shippingaddress,
    user: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
      },
      name: String,
      contact: Number,
      email: String,
      otp: String,
      dob: String,
      walletBalance: Number,
      membership_active: Boolean,
      membership_plan_value: String,
      membership_plan_discount: String,
      membership_subscription: String,
      membershipValidity: String,
      membership_thirtieth_date: String,
      address: Object,
      more_address: Array,
      bottleDelivered: Number,
      bottlePending: Number,
      referral_code: String
    },
    partner: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "partners",
      },
      city: Object,
      hub: Object,
      name: String,
      contact: String,
      document: String,
      address: String,
      email: String,
      otp: Number,
    },
    amount: Number,
    deliverySchedule: Object || Array,
    deliveryDate: String,
    paymentOption: String,
    walletDeductedAmount: String,
    bottleCount: Number,
    otp: String,
    bottleDelivered: Number,
    bottleCollected: Number,
    bottlePending: Number,
    bottleBreakage: Number,
    orderPenalty: Object,
    additionalDetails: Object,
    paymentCollected: Number,
    paymentStatus: String,
    subscriptionAmount: Number,
    reason: String,
    deliveryType: String,
    recharge_amount_via_cash: String,
    route:{
      type:Number,
      default:0
    },
    trial_product_detail:Object
  },
  { timestamps: true }
);

autoIncrement.initialize(mongoose.connection);
order.plugin(mongooseserial, { field: "order_no", digits: 6 });
const orderinstance = new mongoose.model("order", order);
module.exports = orderinstance;
