const { default: axios } = require("axios");
const orderinstance = require("../../model/order");
const userinstance = require("../../model/user");
const subscriptioninstance = require("../../model/subscription");
const { ObjectId } = require("mongodb");
const { SaveNewAddress } = require("../user/controller");
const useraddress = require("../../model/useraddress");
const moment = require("moment");
const addTransaction = require("../../helper/Transaction");
const sendDirectMessage = require("../../helper/SendMessage");
const monthlybillinstance = require("../../model/monthly_bill");
const cartinstance = require("../../model/cart");
const { default: mongoose } = require("mongoose");
// TEST

// const KEY_ID = "rzp_test_QKNSOtZXYW2y9V";
// const KEY_SECRET = "f4ripTPpfDr1hzOKicaGnXJi";

// LIVE
const KEY_ID = "rzp_live_I7EaGKo1y6SDua";
const KEY_SECRET = "ngjUy3OotzoIAA8nA0DkNOSV";

const createOrderOnGateWay = async (req, res, user, orderdata, savedorder) => {
  try {

    const amountInSmallestUnit = Math.round(
      typeof orderdata.amount === 'number'
        ? orderdata.amount * 100
        : Number(orderdata.amount) * 100
    );
    const response = await axios.post(
      "https://api.razorpay.com/v1/orders",
      {
        amount: amountInSmallestUnit,
        currency: "INR",
        receipt: "order_rcptid_11",
        payment_capture: true,
      },
      {
        auth: {
          username: KEY_ID,
          password: KEY_SECRET,
        },
      }
    );

    const order = response.data;
    console.log("orderorder" + JSON.stringify(order));
    const htmlContent = `
      <!DOCTYPE html>
      <html>
  <head>
      <title>Razorpay Payment</title>
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  </head>
  <body>
      <script>
          window.onload = function() {
              var options = {
                  key: ${JSON.stringify(
      KEY_ID
    )}, // Replace with your actual Razorpay key
                  amount: ${order.amount
      }, // Amount in currency subunits (e.g., 50000 for ₹500.00)
                  currency: ${JSON.stringify(order.currency)},
                  name: "Lavya Organic Foods",
                  description: "",
                  image: "",
                  order_id: ${JSON.stringify(order.id)}, 
                  callback_url: "https://admin.lavyacompany.com/${order.id}",
                  prefill: {
                      name: ${JSON.stringify(user.name)},
                      email: ${JSON.stringify(user.email)},
                      contact: ${JSON.stringify(user.contact)}
                  },
                  notes: {
                      address: "Lavya Organic Foods Corporate Office"
                  },
                  theme: {
                      color: "#3399cc"
                  }
              };
              var rzp1 = new Razorpay(options);
              rzp1.on('payment.success', function(response) {
                  var paymentStatus = response.status;
                  window.ReactNativeWebView.postMessage(paymentStatus); // Send payment status to React Native app
              });
              rzp1.open();
            };
      </script>
  </body>
  </html>`;
    // console.log("htmlContent:", htmlContent);
    // return res.status(201).json({ orderderails: order, checkout: htmlContent });
    return res.status(200).json({
      baseResponse: {
        status: 1,
        message: "Order Created Checkout page will be Available to next screen",
      },
      htmlContent: htmlContent,
      orderId: orderdata.order_no,
      savedorder: savedorder,
    });
  } catch (error) {
    console.error("Error creating order:", error.response);
    throw error;
  }
};

const createOrderOnGateWayForWeb = async (req, res, user, orderdata, savedorder) => {
  try {
    const amountInSmallestUnit = Math.round(
      typeof orderdata.amount === 'number'
        ? orderdata.amount * 100
        : Number(orderdata.amount) * 100
    );
    const response = await axios.post(
      "https://api.razorpay.com/v1/orders",
      {
        amount: amountInSmallestUnit,
        currency: "INR",
        receipt: "order_rcptid_11",
        payment_capture: true,
      },
      {
        auth: {
          username: KEY_ID,
          password: KEY_SECRET,
        },
      }
    );

    const order = response.data;
    return res.status(200).json({
      baseResponse: {
        status: 1,
        message: "order create successfully",
      },
      order: order,
      savedorder: savedorder,
    });
  } catch (error) {
    console.error("Error creating order:", error.response);
    throw error;
  }
}

const CreateOrderr = async (req, res) => {
  const {
    orderPlace,
    product,
    user,
    shippingaddress,
    status,
    amount,
    deliverySchedule,
    deliveryDate,
    paymentOption,
    walletDeductedAmount,
    deliveryType,
    type
  } = req.body;

  const parsedDeliveryDate = moment(deliveryDate).format("DD/MM/YYYY");

  if (user && shippingaddress) {

    const userDetailsAddress = await userinstance.findOne({
      _id: new ObjectId(user._id),
    });


    const createNewOrder = new orderinstance({
      orderPlace,
      product,
      user,
      shippingaddress,
      status,
      amount,
      deliverySchedule,
      deliveryDate, // Use parsed delivery date
      paymentOption,
      walletDeductedAmount,
      deliveryType,
    });


    const tomorrow = moment().add(1, "day").format("DD/MM/YYYY");

    if (parsedDeliveryDate === tomorrow) {
      createNewOrder.status = "NEXTDAYDELIVERY";
    }


    const address = await useraddress.findOne({
      userId: new ObjectId(user._id),
      location: shippingaddress.location,
    });
    let savedorder = {};
    if (await createNewOrder.save()) {
      const orderdata = createNewOrder;
      savedorder = await createNewOrder.save();

      console.log("user" + JSON.stringify(user));
      console.log("orderdata" + JSON.stringify(orderdata));
      console.log("savedorder" + JSON.stringify(savedorder));
      if (type == "web") {
        await createOrderOnGateWayForWeb(req, res, user, orderdata, savedorder);
      } else {
        await createOrderOnGateWay(req, res, user, orderdata, savedorder);
      }
      console.log("Amount:", amount, "Type:", typeof amount);
      console.log("Membership Plan Discount:", userDetailsAddress.membership_plan_discount, "Type:", typeof userDetailsAddress.membership_plan_discount);

      // Ensure both values are numbers
      let amountNumber = Number(amount);
      let discountNumber = Number(userDetailsAddress.membership_plan_discount);

      console.log("Amount after conversion:", amountNumber, "Type:", typeof amountNumber);
      console.log("Membership Plan Discount after conversion:", discountNumber, "Type:", typeof discountNumber);
      console.log("Condition check:", amountNumber >= discountNumber);

      if (amountNumber >= discountNumber) {
        await userinstance.findOneAndUpdate(
          { _id: new ObjectId(user._id) },
          {
            $set: {
              membership_active: false,
              membership_plan_value: "",
              membership_plan_discount: "",
              membership_subscription: "",
              membershipValidity: "",
              membership_thirtieth_date: "",
            },
          }
        );
      }

      if (amountNumber < discountNumber) {
        const val = discountNumber - amountNumber;
        await userinstance.findOneAndUpdate(
          { _id: new ObjectId(user._id) },
          {
            $set: {
              membership_plan_discount: val,
            },
          }
        );
      }

      if (
        userDetailsAddress.address?.location !== shippingaddress.location ||
        userDetailsAddress.address?.street !== shippingaddress.street ||
        userDetailsAddress.address?.address !== shippingaddress.address ||
        userDetailsAddress.address?.landmark !== shippingaddress.landmark
      ) {
        if (
          !(
            address?.location === shippingaddress.location &&
            address?.address === shippingaddress.address &&
            address?.landmark === shippingaddress.landmark &&
            address?.street === shippingaddress.street
          )
        ) {
          const newAddress = new useraddress({
            location: shippingaddress.location,
            street: shippingaddress.street,
            address: shippingaddress.address,
            landmark: shippingaddress.landmark,
            locationObj: shippingaddress.locationObj,
            userId: user._id,
          });

          await newAddress.save();
        }
        await userinstance.findOneAndUpdate(
          { _id: new ObjectId(user._id) },
          {
            $set: {
              address: shippingaddress,
              more_address: [shippingaddress],
            },
          }
        );
      }
      if (status === "ORDERED") {
        await cartinstance.deleteMany({ user: user._id });
      }
    }
  } else {
    res.status(500).json({
      baseresponse: { message: "Internal Server Error", status: 0 },
    });
  }
};

const uniqid = require('uniqid');
const crypto = require('crypto');
const productinstance = require("../../model/products");
const PHONE_PE_HOST_URL = "https://api.phonepe.com/apis/hermes";
const MERCHANT_ID = "M22PRUSIANRN3";
const SALT_INDEX = 1;
const SALT_KEY = "a1961fed-66ae-4f8a-95eb-4ebaca87f936";

const CreateOrder = async (req, res) => {
  const { id } = req.params;
  const { order_data } = req.body;
  const metadata = order_data;
  const amountInSmallestUnit = Math.round(
    typeof order_data.amount === 'number'
      ? order_data.amount * 100
      : Number(order_data.amount) * 100
  );
  const encodedMetadata = encodeURIComponent(JSON.stringify(metadata));
  try {
    const payEndpoint = "/pg/v1/pay";
    const merchantTransactionId = uniqid();
    const payload = {
      "merchantId": MERCHANT_ID,
      "merchantTransactionId": merchantTransactionId,
      "merchantUserId": id,
      "amount": amountInSmallestUnit,
      "redirectUrl": `${process.env.API_URL}/order/validate-transaction/${merchantTransactionId}?metadata=${encodedMetadata}`,
      "redirectMode": "REDIRECT",
      "mobileNumber": "9999999999",
      "paymentInstrument": {
        "type": "PAY_PAGE"
      }
    };

    const bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
    const base64EncodedPayload = bufferObj.toString("base64");

    const hash = crypto.createHash('sha256').update(base64EncodedPayload + payEndpoint + SALT_KEY).digest('hex');
    console.log('hash', hash);
    const xVerify = hash + "###" + SALT_INDEX;
    console.log(xVerify);

    const options = {
      method: 'post',
      url: `${PHONE_PE_HOST_URL}${payEndpoint}`,
      headers: {
        'Content-Type': 'application/json',
        "X-VERIFY": xVerify
      },
      data: {
        "request": base64EncodedPayload
      }
    };
    console.log('options', JSON.stringify(options));
    axios
      .request(options)
      .then(function (response) {
        console.log(response.data);
        res.status(200).json({
          baseResponse: {
            status: 1,
            message: "order create successfully"
          },
          response: response.data
        });
      })
      .catch(function (error) {
        console.error("error", error);
        res.status(500).send('Internal Server Error');
      });
  } catch (error) {
    console.error("Error creating order:", error.response);
    throw error;
  }
};

const ValidateTransaction = async (req, res) => {
  const { transactionId } = req.params;
  const { metadata } = req.query;
  try {
    const statusEndpoint = `/pg/v1/status/${MERCHANT_ID}/${transactionId}`;
    const url = `${PHONE_PE_HOST_URL}${statusEndpoint}`;

    // Create X-VERIFY hash
    const hashString = `${statusEndpoint}${SALT_KEY}`;
    const hash = crypto.createHash('sha256').update(hashString).digest('hex');
    const xVerify = `${hash}###${SALT_INDEX}`;

    // Set options for API call
    const options = {
      method: 'get',
      url: url,
      headers: {
        'Content-Type': 'application/json',
        'X-MERCHANT-ID': MERCHANT_ID,
        'X-VERIFY': xVerify
      }
    };
    const response = await axios.request(options);
    const paymentDetails = response.data;
    console.log(paymentDetails);
    if (paymentDetails.data.state == "COMPLETED")  {
      const parsedMetadata = JSON.parse(decodeURIComponent(metadata));
      const {
        orderPlace,
        product,
        user,
        shippingaddress,
        status,
        paymentStatus,
        amount,
        deliverySchedule,
        deliveryDate,
        paymentOption,
        walletDeductedAmount,
        deliveryType
      } = parsedMetadata;

      const parsedDeliveryDate = moment(deliveryDate).format("DD/MM/YYYY");

      if (user && shippingaddress) {

        const userDetailsAddress = await userinstance.findOne({
          _id: new ObjectId(user._id),
        });
        const createNewOrder = new orderinstance({
          orderPlace,
          product,
          user,
          shippingaddress,
          status,
          paymentStatus,
          amount,
          deliverySchedule,
          deliveryDate,
          paymentOption,
          walletDeductedAmount,
          deliveryType,
        });


        const tomorrow = moment().add(1, "day").format("DD/MM/YYYY");

        if (parsedDeliveryDate === tomorrow) {
          createNewOrder.status = "NEXTDAYDELIVERY";
        }


        const address = await useraddress.findOne({
          userId: new ObjectId(user._id),
          location: shippingaddress.location,
        });
        let savedorder = {};
        if (await createNewOrder.save()) {
          const orderdata = createNewOrder;
          savedorder = await createNewOrder.save();
          let amountNumber = Number(amount);
          let discountNumber = Number(userDetailsAddress.membership_plan_discount);

          if (amountNumber >= discountNumber) {
            await userinstance.findOneAndUpdate(
              { _id: new ObjectId(user._id) },
              {
                $set: {
                  membership_active: false,
                  membership_plan_value: "",
                  membership_plan_discount: "",
                  membership_subscription: "",
                  membershipValidity: "",
                  membership_thirtieth_date: "",
                },
              }
            );
          }

          if (amountNumber < discountNumber) {
            const val = discountNumber - amountNumber;
            await userinstance.findOneAndUpdate(
              { _id: new ObjectId(user._id) },
              {
                $set: {
                  membership_plan_discount: val,
                },
              }
            );
          }

          if (
            userDetailsAddress.address?.location !== shippingaddress.location ||
            userDetailsAddress.address?.street !== shippingaddress.street ||
            userDetailsAddress.address?.address !== shippingaddress.address ||
            userDetailsAddress.address?.landmark !== shippingaddress.landmark
          ) {
            if (
              !(
                address?.location === shippingaddress.location &&
                address?.address === shippingaddress.address &&
                address?.landmark === shippingaddress.landmark &&
                address?.street === shippingaddress.street
              )
            ) {
              const newAddress = new useraddress({
                location: shippingaddress.location,
                street: shippingaddress.street,
                address: shippingaddress.address,
                landmark: shippingaddress.landmark,
                locationObj: shippingaddress.locationObj,
                userId: user._id,
              });

              await newAddress.save();
            }
            await userinstance.findOneAndUpdate(
              { _id: new ObjectId(user._id) },
              {
                $set: {
                  address: shippingaddress,
                  more_address: [shippingaddress],
                },
              }
            );
          }
          if (status === "ORDERED") {
            await cartinstance.deleteMany({ user: user._id });
          }
        }
      } else {
        res.status(500).json({
          baseresponse: { message: "Internal Server Error", status: 0 },
        });
      }
      if (Number(walletDeductedAmount) > 0) {
        const amount = Number(walletDeductedAmount);
        const _id = user._id;
        const userData = await userinstance.findById(_id);
        if (userData.walletBalance < amount) {
          return res.status(200).json({
            baseresponse: {
              message: "Insufficient balance to deduct balance",
              status: 0,
            },
          });
        }
        const updatedWalletBalance = parseInt(userData.walletBalance) - parseInt(amount);
        await userinstance.findOneAndUpdate(
          { _id: _id },
          {
            $set: {
              walletBalance: updatedWalletBalance,
            },
          },
          { new: true }
        );
        await addTransaction(_id, "Dr", amount, "Amount deducted in your wallet");
      }
      const updatePromises = product.map(async (item) => {
        const product = await productinstance.findById(item.id);

        if (product) {
          const newStock = product.stock - item.selQty;
          return productinstance.findOneAndUpdate(
            { _id: item.id },
            { stock: newStock }
          );
        }
      });
      await Promise.all(updatePromises);
      res.redirect(`${process.env.WEB_URL}/order-success?transactionId=${paymentDetails.data.transactionId}&amount=${paymentDetails.data.amount / 100}`);
    }else{
      res.redirect(`${process.env.WEB_URL}/order-failed?message=${paymentDetails.message}&amount=${paymentDetails.data.amount / 100}`);
    }
  } catch (error) {
    console.error("Error fetching payment status:", error.response?.data || error.message);
    res.status(500).send(`
          <html>
              <body>
                  <h1>Error</h1>
                  <p>${error.response?.data?.message || 'Unable to fetch payment status. Please try again later.'}</p>
              </body>
          </html>
      `);
  }
};

const CreateOrderByWalletAndCOD = async (req, res) => {
  const {
    orderPlace,
    product,
    user,
    shippingaddress,
    status,
    amount,
    deliverySchedule,
    deliveryDate,
    paymentOption,
    walletDeductedAmount,
    deliveryType,
    type
  } = req.body;

  const parsedDeliveryDate = moment(deliveryDate).format("DD/MM/YYYY");

  if (user && shippingaddress) {

    const userDetailsAddress = await userinstance.findOne({
      _id: new ObjectId(user._id),
    });


    const createNewOrder = new orderinstance({
      orderPlace,
      product,
      user,
      shippingaddress,
      status,
      amount,
      deliverySchedule,
      deliveryDate, // Use parsed delivery date
      paymentOption,
      walletDeductedAmount,
      deliveryType,
    });


    const tomorrow = moment().add(1, "day").format("DD/MM/YYYY");

    if (parsedDeliveryDate === tomorrow) {
      createNewOrder.status = "NEXTDAYDELIVERY";
    }


    const address = await useraddress.findOne({
      userId: new ObjectId(user._id),
      location: shippingaddress.location,
    });
    let savedorder = {};
    if (await createNewOrder.save()) {
      const orderdata = createNewOrder;
      savedorder = await createNewOrder.save();

      console.log("user" + JSON.stringify(user));
      console.log("orderdata" + JSON.stringify(orderdata));
      console.log("savedorder" + JSON.stringify(savedorder));
      console.log("Amount:", amount, "Type:", typeof amount);
      console.log("Membership Plan Discount:", userDetailsAddress.membership_plan_discount, "Type:", typeof userDetailsAddress.membership_plan_discount);

      // Ensure both values are numbers
      let amountNumber = Number(amount);
      let discountNumber = Number(userDetailsAddress.membership_plan_discount);

      console.log("Amount after conversion:", amountNumber, "Type:", typeof amountNumber);
      console.log("Membership Plan Discount after conversion:", discountNumber, "Type:", typeof discountNumber);
      console.log("Condition check:", amountNumber >= discountNumber);

      if (amountNumber >= discountNumber) {
        await userinstance.findOneAndUpdate(
          { _id: new ObjectId(user._id) },
          {
            $set: {
              membership_active: false,
              membership_plan_value: "",
              membership_plan_discount: "",
              membership_subscription: "",
              membershipValidity: "",
              membership_thirtieth_date: "",
            },
          }
        );
      }

      if (amountNumber < discountNumber) {
        const val = discountNumber - amountNumber;
        await userinstance.findOneAndUpdate(
          { _id: new ObjectId(user._id) },
          {
            $set: {
              membership_plan_discount: val,
            },
          }
        );
      }

      if (
        userDetailsAddress.address?.location !== shippingaddress.location ||
        userDetailsAddress.address?.street !== shippingaddress.street ||
        userDetailsAddress.address?.address !== shippingaddress.address ||
        userDetailsAddress.address?.landmark !== shippingaddress.landmark
      ) {
        if (
          !(
            address?.location === shippingaddress.location &&
            address?.address === shippingaddress.address &&
            address?.landmark === shippingaddress.landmark &&
            address?.street === shippingaddress.street
          )
        ) {
          const newAddress = new useraddress({
            location: shippingaddress.location,
            street: shippingaddress.street,
            address: shippingaddress.address,
            landmark: shippingaddress.landmark,
            locationObj: shippingaddress.locationObj,
            userId: user._id,
          });

          await newAddress.save();
        }
        await userinstance.findOneAndUpdate(
          { _id: new ObjectId(user._id) },
          {
            $set: {
              address: shippingaddress,
              more_address: [shippingaddress],
            },
          }
        );
      }
      if (status === "ORDERED") {
        await cartinstance.deleteMany({ user: user._id });
      }
      return res.status(200).json({
        baseResponse: {
          status: 1,
          message: "order create successfully",
        },
        savedorder: savedorder,
      });
    }
  } else {
    res.status(500).json({
      baseresponse: { message: "Internal Server Error", status: 0 },
    });
  }
};
const defineRoute = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { route } = req.body;
    await orderinstance.findOneAndUpdate({ _id: order_id }, { route: route });
    res.status(200).json({
      baseResponse: { message: "Route update successfully Successfully", status: 1 },
      response: orderinstance,
    });
  } catch (error) {
    res.status(500).json({
      baseresponse: { message: "Internal Server Error", status: 0 },
    });
  }
};

const addressSavelogic = async ({ user, shippingaddress, amount }) => {
  const userDetailsAddress = await userinstance.findOne({
    _id: new ObjectId(user._id),
  });
  console.log({
    _id: new ObjectId(user._id),
  });
  const address = await useraddress.findOne({
    userId: new ObjectId(user._id),
    location: shippingaddress.location,
  });
  console.log(user);
  console.log(address);
  if (amount > userDetailsAddress.membership_plan_discount) {
    await userinstance.findOneAndUpdate(
      { _id: new ObjectId(user._id) },
      {
        $set: {
          membership_active: false,
          membership_plan_value: "",
          membership_plan_discount: "",
          membership_subscription: "",
          membershipValidity: "",
          membership_thirtieth_date: "",
        },
      }
    );
  }

  if (
    userDetailsAddress.address?.location === shippingaddress.location &&
    userDetailsAddress.address?.street === shippingaddress.street &&
    userDetailsAddress.address?.address === shippingaddress.address &&
    userDetailsAddress.address?.landmark === shippingaddress.landmark
  ) {
    console.log("No address");
    return;
  } else {
    await userinstance.findOneAndUpdate(
      { _id: new ObjectId(user._id) },
      {
        $set: {
          address: shippingaddress,
          more_address: [shippingaddress],
        },
      }
    );
    if (
      address?.location === shippingaddress.location &&
      address?.address === shippingaddress.address &&
      address?.landmark === shippingaddress.landmark &&
      address?.street === shippingaddress.street
    ) {
      return;
    } else {
      const newAddress = await new useraddress({
        location: shippingaddress.location,
        street: shippingaddress.street,
        address: shippingaddress.address,
        landmark: shippingaddress.landmark,
        locationObj: shippingaddress.locationObj,
        userId: user._id,
      });

      await newAddress.save();
    }
  }
};

const orderSubscribed = async (req, res) => {
  const {
    orderPlace,
    product,
    user,
    shippingaddress,
    status,
    amount,
    deliverySchedule,
    deliveryDate,
    paymentOption,
    walletDeductedAmount,
    deliveryType,
    recharge_amount_via_cash,
    trial_product_detail
  } = req.body;
  const createNewOrder = await new orderinstance({
    orderPlace,
    product,
    user,
    shippingaddress,
    status,
    amount,
    deliverySchedule,
    deliveryDate,
    paymentOption,
    walletDeductedAmount,
    bottleDelivered: 0,
    bottlePending: 0,
    subscriptionAmount: amount,
    deliveryType,
    recharge_amount_via_cash,
    trial_product_detail
  });

  if (user && status) {
    const order = await createNewOrder.save();
    if (order) {
      addressSavelogic({ user, shippingaddress, amount });
      const message = `Dear customer your ${order?.product[0]?.name} subscription is successfully activated and your subscription number is ${order.order_no} and Your delivery start on ${order.deliveryDate}. Thank you for subscription Regards team Lavya organic & technology.`;
      const templateId = "1207172373132906444";
      sendDirectMessage(user.contact, templateId, message).then(response => {
        console.log("Message Sent Response:", response);
      });
      res.status(200).json({
        baseResponse: {
          message: "Order Created Successfully and Subscribed successfully",
          status: 1,
        },
        response: order,
        // response: createOrder(),`
      });
    }
  } else {
    res
      .status(500)
      .json({ baseresponse: { message: "Internal Server Error", status: 0 } });
  }
};

const GetAllOrder = async (req, res) => {
  try {
    const GetAllOrder = await orderinstance.find({});
    if (GetAllOrder !== null) {
      res.status(200).json({
        baseResponse: { message: "Order Fetched Successfully", status: 1 },
        response: GetAllOrder,
      });
    } else {
      res.status(500).json({
        baseresponse: { message: "Internal Server Error", status: 0 },
      });
    }
  } catch (error) {
    res.status(200).json({
      baseresponse: { message: error.message, status: 0 },
    });
  }
};

const getPayIdByOrderId = async (req, res) => {
  const { orderId } = req.params;
  try {
    const response = await axios.get(
      `https://api.razorpay.com/v1/orders/${orderId}/payments`,
      {
        auth: {
          username: KEY_ID,
          password: KEY_SECRET,
        },
      }
    );

    const order = response.data;

    return res.status(201).json({
      orderDetails: order,
      status: "OK",
    });
  } catch (error) {
    return res.status(200).json({
      error: "ERROR",
      status: "ERROR",
    });
  }
};

const GetOrderById = async (req, res) => {
  const { _id } = req.params;
  console.log(_id);
  // try {
  const orderById = await orderinstance.findOne({ _id });
  if (orderById !== null) {
    res.status(200).json({
      baseResponse: { message: "Order Fetched Successfully", status: 1 },
      response: orderById,
    });
  } else {
    res.status(500).json({
      baseresponse: { message: "Internal Server Error", status: 0 },
    });
  }
  // } catch (error) {
  //   res.status(200).json({
  //     baseresponse: { message: error, status: 0 },
  //   });
  // }
};

const UpdateStatusForOrderById = async (req, res) => {
  const { _id } = req.params;
  const { status } = req.body;
  // console.log(_id);
  const findDelievery = await orderinstance.findOne({ _id: new ObjectId(_id) });
  const multiplySelQtyReducer = (accumulator, item) => {
    return 1 * item.selQty;
  };

  // Using reduce to get the product of selQty values
  // Start with an initial value of 1 since we are multiplying
  const totalProduct = findDelievery.product.reduce(multiplySelQtyReducer, 1);
  // console.log("totalProduct:", totalProduct);
  try {
    const UpdateOrder = await orderinstance.findOneAndUpdate(
      { _id: new ObjectId(_id) },
      {
        $set: {
          status: status,
          paymentOption:
            findDelievery.paymentOption === "payViaCash"
              ? "Wallet"
              : findDelievery.paymentOption,
        },
        $inc: {
          bottleDelivered:
            status === "DELIVERED" &&
            findDelievery.bottleDelivered === 0 &&
            totalProduct,
          bottlePending:
            status === "DELIVERED" &&
            findDelievery.bottlePending === 0 &&
            totalProduct,
          bottleCollected: 0,
          bottleBreakage: 0,
        },
      },
      { new: true }
    );
    // console.log(UpdateOrder,"ed")
    if (status === "DELIVERED") {
      const productsToCreate = UpdateOrder.product.filter(product => {
        const subscriptionType = product?.subscription_type[0].toLowerCase();
        return ['daily', 'weekly', 'alternatively'].includes(subscriptionType);
      }).map(product => ({
        product_id: product.id,
        user_id: UpdateOrder.user._id,
        qty: product.selQty,
        subscription_type: product.subscription_type[0]
      }));
      console.log(productsToCreate, "dr")
      if (productsToCreate.length > 0) {
        await monthlybillinstance.create(productsToCreate);
      }
    }
    if (UpdateOrder !== null) {
      res.status(200).json({
        baseResponse: { message: "Order Fetched Successfully", status: 1 },
        response: UpdateOrder,
      });
    } else {
      res.status(500).json({
        baseresponse: { message: "Internal Server Error", status: 0 },
      });
    }
  } catch (error) {
    res.status(200).json({
      baseresponse: { message: error, status: 0 },
    });
  }
};

const CancelSubscriptonByOrder = async (req, res) => {
  const { _id } = req.params;
  const { status, reason } = req.body;
  try {
    const UpdateOrder = await orderinstance.findOneAndUpdate(
      { _id: _id },
      {
        $set: {
          status: status,
          reason: reason,
        },
      },
      { new: true }
    );
    if (UpdateOrder !== null) {
      res.status(200).json({
        baseResponse: { message: "Order Fetched Successfully", status: 1 },
        response: UpdateOrder,
      });
    } else {
      res.status(500).json({
        baseresponse: { message: "Internal Server Error", status: 0 },
      });
    }
  } catch (error) {
    res.status(200).json({
      baseresponse: { message: error, status: 0 },
    });
  }
};

const assignOrderToPartner = async (req, res) => {
  const { _id } = req.params;
  const { start_date, status, partner } = req.body;
  try {
    const UpdateOrder = await orderinstance.findOneAndUpdate(
      { _id: _id },
      {
        $set: {
          status: status,
          partner: partner,
          deliveryDate: start_date
        },
      },
      { new: true }
    );
    if (UpdateOrder !== null) {
      res.status(200).json({
        baseResponse: { message: "Order Fetched Successfully", status: 1 },
        response: UpdateOrder,
      });
    } else {
      res.status(500).json({
        baseresponse: { message: "Internal Server Error", status: 0 },
      });
    }
  } catch (error) {
    res.status(200).json({
      baseresponse: { message: error, status: 0 },
    });
  }
};

const filterOrderByStatus = async (req, res) => {
  const { status } = req.params;
  const findAll = await orderinstance.find({ status: status });

  if (findAll.length > 0) {
    res.status(200).json({
      baseResponse: { message: "Found with the given status", status: 1 },
      response: findAll,
    });
  } else {
    res.status(200).json({
      baseResponse: {
        message: "Something went wrong while fetching",
        status: 0,
      },
    });
  }
};

const UpdatePaymentAndOrderStatusById = async (req, res) => {
  const { order_id } = req.params;
  const { status, paymentStatus } = req.body;
  console.log(order_id);
  console.log(status);
  console.log(paymentStatus);
  // try {
  const UpdateOrder = await orderinstance.findOneAndUpdate(
    { order_no: order_id },
    {
      $set: {
        status: status,
        paymentStatus: paymentStatus,
      },
    },
    { new: true }
  );
  if (paymentStatus != "FAILED") {
    const message = `DEAR ${UpdateOrder.user.name} YOUR ORDER CONFIRM SUCCESSFULLY BY LAVYA ORGANIC & TECHNOLOGY AND YOUR DELIVERY START FROM ${UpdateOrder.deliveryDate}. REGARDS TEAM LAVYA GROUP`;
    const templateId = "1207171170721039778";
    sendDirectMessage(UpdateOrder?.user?.contact, templateId, message).then(response => {
      console.log("Message Sent Response:", response);
    });
  }
  if (paymentStatus == "PAIDONLINE") {
    await cartinstance.deleteMany({ user: UpdateOrder?.user?._id });
    addTransaction(UpdateOrder.user._id, "Dr", UpdateOrder.amount, "Order created successfully");
  }
  res.status(200).json({
    baseResponse: { message: "Order Fetched Successfully", status: 1 },
    response: UpdateOrder,
  });
};

module.exports = {
  CreateOrder,
  CreateOrderByWalletAndCOD,
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
  ValidateTransaction
};
