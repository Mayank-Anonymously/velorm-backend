const express = require("express");
const {
  CreateOrder,
  GetAllOrder,
  GetOrderById,
  UpdateStatusForOrderById,
  getPayIdByOrderId,
  assignOrderToPartner,
  orderSubscribed,
  CancelSubscriptonByOrder,
  filterOrderByStatus,
  UpdatePaymentAndOrderStatusById,
  defineRoute,
  ValidateTransaction,
  CreateOrderByWalletAndCOD
} = require("../../controller/Order/controller");
const orderrouter = express.Router();

orderrouter.post("/create-new-order", CreateOrder);
orderrouter.post("/create-order-by-wallet-and-cod", CreateOrderByWalletAndCOD);
orderrouter.get("/validate-transaction/:transactionId", ValidateTransaction);
orderrouter.post("/define-route/:order_id",defineRoute);
orderrouter.get("/get-all-orders", GetAllOrder);
orderrouter.get("/get-order-by-id/:_id", GetOrderById);
orderrouter.patch("/update-order-by-id/:_id", UpdateStatusForOrderById);
orderrouter.put("/update-order-by-id/:_id", CancelSubscriptonByOrder);
orderrouter.get("/get-payment-details-by-id/:orderId", getPayIdByOrderId);
orderrouter.patch("/assign-to-partner/:_id", assignOrderToPartner);
orderrouter.post("/order-subscribed", orderSubscribed);
orderrouter.get("/get-order-by-status/:status", filterOrderByStatus);
orderrouter.patch(
  "/update-order-and-payment-status/:order_id",
  UpdatePaymentAndOrderStatusById
);

module.exports = orderrouter;

/* https://api.lavyacompany.com/api/v1/order/update-order-by-id/:ORDER_ID_DIRECT */
/* PAYLOAD : {
  METHOD :"PUT",
  DATA : {
    "status" :
  [ "CANCELLEDBYPARTNER",
    "CANCELLEDBYADMIN",
    "CANCELLEDBYCUSTOMER",
      ],
      reason : "REASON from frontend"
  }
} */

/* https://api.lavyacompany.com/api/v1/order/get-order-by-id/:ORDER_ID_DIRECT */
/* https://api.lavyacompany.com/api/v1/order/get-order-by-id/6624e2faa3bd4fd5287d508e */

/* https://api.lavyacompany.com/api/v1/order-verification/generate-otp-on-delivery */

/* PAYLOAD : {
  _id : ORDER_ID,
  contact : CUSTOMER_NUMBER
} */

/* https://api.lavyacompany.com/api/v1/order-verification/verify-otp-on-delivery */
/* PAYLOAD : {

  _id : ORDER_ID,
  otp : CUSTOMER_OTP 
}
*/

/* https://api.lavyacompany.com/api/v1/order/update-order-by-id/:ORDER_ID_DIRECT 

  PAYLOAD : {
    "status" :  ENUM_VALUES }*/
