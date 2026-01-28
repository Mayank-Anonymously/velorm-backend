const { ObjectId } = require("mongodb");
const userinstance = require("../../model/user");
const manualrechargeinstance = require("../../model/manual_recharge");
const networkinstance = require("../../model/Network");
const axios = require("axios");
const addTransaction = require("../../helper/Transaction");
const userrechargeinstance = require("../../model/user_recharge");
const mongoose = require("mongoose");

// TEST
// const KEY_ID = "rzp_test_QKNSOtZXYW2y9V";
// const KEY_SECRET = "f4ripTPpfDr1hzOKicaGnXJi";

// LIVE
const KEY_ID = "rzp_live_I7EaGKo1y6SDua";
const KEY_SECRET = "ngjUy3OotzoIAA8nA0DkNOSV";

const generateReferralCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let referralCode = '';
  for (let i = 0; i < 8; i++) {
    referralCode += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return referralCode;
};

const apiCallForOtp = async (contact, otp) => {
  let config = {
    method: "get",
    url: `http://alwar.smsalwar.in/vb/apikey.php?apikey=DX3uToPiTxpg5r8K&senderid=LAVYAG&number=${contact}&templateId=1207171145808954402&message=YOUR+LOGIN+OTP+IS+${otp}+THANK+YOU+FOR+CHOOSING+LAVYA.REGARDS+TEAM+LAVYA+GROUP.`,
    // url: `https://sms.digidonar.com/app/smsapi/index.php?key=365AF87E75E3DD&campaign=11584&routeid=101494&type=text&contacts=${contact}&senderid=LAVYAG&msg=YOUR+LOGIN+OTP+IS+${otp}.REGARDS+TEAM+LAVYA+GROUP.&template_id=1207169165998073277&pe_id=1201160924715997970`,
    headers: {},
  };
  const apiFetch = await axios(config);
  return apiFetch.data;
};

const GenerateOTPWithContact = async (req, res) => {
  const { contact, referral_code } = req.body;

  try {
    const IfAlreadyExist = await userinstance.find({
      contact: parseInt(contact),
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    apiCallForOtp(contact, otp)
      .then(async (response) => {
        if (response.status == "Success") {
          if (IfAlreadyExist.length !== 0) {
            res.status(200).json({
              baseResponse: { status: "EXISTS", message: "User already exist" },
              response: await userinstance.findOneAndUpdate(
                { contact: contact },
                { $set: { otp } },
                { returnDocument: "after" }
              ),
            });
          } else {
            if (referral_code) {
              const IfReferralCodeAlreadyExist = await userinstance.findOne({ referral_code });
              if (IfReferralCodeAlreadyExist) {
                let referral_amount = 100;
                const newuser = new userinstance({
                  contact,
                  otp,
                  walletBalance: 0,
                  referral_code: generateReferralCode()
                });
                await userinstance.updateOne({ _id: IfReferralCodeAlreadyExist._id }, { walletBalance: IfReferralCodeAlreadyExist.walletBalance + referral_amount });
                const result = await newuser.save();
                await networkinstance.create({
                  user_id: result._id,
                  parent_user_id: IfReferralCodeAlreadyExist._id,
                  referral_code: referral_code
                })
                return res.status(200).json({
                  baseResponse: {
                    status: 1,
                    message: "User Added Successfully.",
                  },
                  response: result
                });
              } else {
                return res.status(200).json({
                  baseResponse: { message: "Referral code doesn't exists" },
                });
              }
            }
            else {
              const newuser = new userinstance({
                contact,
                otp,
                walletBalance: 0,
                referral_code: generateReferralCode()
              });
              res.status(200).json({
                baseResponse: {
                  status: 1,
                  message: "User Added Successfully.",
                },
                response: await newuser.save(),
              });
            }
          }
        }
      })
      .catch((error) => {
        res.status(500).send("Internal Server Error");
      });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const authlogin = async (req, res) => {
  try {
    const { name, email, contact, dob } = req.body;
    const IfAlreadyExist = await userinstance.find({ email: email });
    if (IfAlreadyExist.length !== 0) {
      res.status(200).json({
        baseResponse: { status: "EXISTS", message: "Email already exist" },
      });
    } else {
      res.status(200).json({
        baseResponse: {
          status: 1,
          message: "User Added Successfully.",
        },
        response: await userinstance.findOneAndUpdate(
          { contact: contact },
          {
            $set: {
              name: name,
              email: email,
              dob: dob,
              membership_active: false,
              membership_plan_validity: "",
            },
          },
          { returnDocument: "after" }
        ),
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ baseResponse: { status: 0, message: "Internal Server Error" } });
  }
};

const editUserDetails = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { name, email } = req.body;
    const user = await userinstance.findOneAndUpdate(
      { _id: user_id },
      {
        $set: {
          name: name,
          email: email
        },
      },
      { returnDocument: "after" }
    )
    res.status(200).json({
      baseResponse: {
        status: 1,
        message: "User Detail Edit Successfully.",
      },
      response: user
    });
  } catch (error) {
    res
      .status(500)
      .json({ baseResponse: { status: 0, message: "Internal Server Error" } });
  }
};

const userlogin = async (req, res) => {
  try {
    const { name, contact, otp, email } = req.body;

    // Verify OTP
    const user = await userinstance.findOne({ contact, otp });

    if (!user) {
      res.status(200).json({
        baseResponse: { message: "Invalid OTP" },
      });
    } else {
      res.status(200).json({
        baseResponse: {
          status: 1,
          message: "User Verified Successfully",
        },
        detailsAdded: Object.keys(user._doc).includes("name"),
        details: user,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
const userbyid = async (req, res) => {
  try {
    const { _id } = req.params;
    const user = await userinstance.findOne({ _id: _id });
    if (!user) {
      return res
        .status(404)
        .json({ baseresponse: { message: "User not found", status: 0 } });
    } else {
      res.status(200).json({
        baseResponse: {
          status: 1,
          message: "User Found Successfully",
        },
        details: user,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// const RechargeWallet = async (req, res) => {
//   const { id } = req.params;
//   const { amount, currency, notes,type } = req.body;
//   const userid = await userinstance.findOne({ _id: new ObjectId(id) });
//   try {
//     if (userid !== null) {
//       const response = await axios.post(
//         "https://api.razorpay.com/v1/orders",
//         {
//           amount: Number(amount) * 100, 
//           currency: currency,
//           receipt: "balance_update_rcptid_11",
//           payment_capture: true,
//         },
//         {
//           auth: {
//             username: KEY_ID,
//             password: KEY_SECRET,
//           },
//         }
//       );
//       const order = response.data;

//       if(type=="web"){
//         return res.status(200).json({
//           baseResponse: {
//             status: 1,
//             message: "order create successfully",
//           },
//           order:order
//         });
//       }

//       const htmlContent = `
//     <!DOCTYPE html>
//     <html>
// <head>
//     <title>Razorpay Payment</title>
//     <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
// </head>
// <body>
//     <script>
//         window.onload = function() {
//             var options = {
//                 key: ${JSON.stringify(
//         KEY_ID
//       )}, // Replace with your actual Razorpay key
//                 amount: ${order.amount
//         }, // Amount in currency subunits (e.g., 50000 for ₹500.00)
//                 currency: ${JSON.stringify(order.currency)},
//                 name: "Lavya Organic Foods",
//                 description: "",
//                 image: "",
//                 order_id: ${JSON.stringify(order.id)}, 
//                 callback_url: "https://admin.lavyacompany.com/${order.id}",
//                 prefill: {
//                     name: ${JSON.stringify(userid.name)},
//                     email: ${JSON.stringify(userid.email)},
//                     contact: ${JSON.stringify(userid.contact)}
//                 },
//                 notes: {
//                     address: ${JSON.stringify(notes)}
//                 },
//                 theme: {
//                     color: "#3399cc"
//                 }
//             };
//             var rzp1 = new Razorpay(options);
//             rzp1.open();
//         };
//     </script>
// </body>
// </html>`;
//       res.status(201).json({
//         orderDetails: order,
//         checkout: htmlContent,
//       });
//     } else {
//       res.status(200).json({
//         orderDetails: [],
//         error: "USER ID IS BLANK",
//       });
//     }
//   } catch (error) {
//     console.error("Error creating order:", error.response);
//     throw error;
//   }
// };

const uniqid = require('uniqid');
const crypto = require('crypto');
const PHONE_PE_HOST_URL = "https://api.phonepe.com/apis/hermes";
const MERCHANT_ID = "M22PRUSIANRN3";
const SALT_INDEX = 1;
const SALT_KEY = "a1961fed-66ae-4f8a-95eb-4ebaca87f936";

const RechargeWallet = async (req, res) => {
  const { id } = req.params;
  const { amount, cashback, addedamount } = req.body;
  const metadata = {
    user_id:id,
    addedamount:addedamount,
    cashback:cashback
  };
  const encodedMetadata = encodeURIComponent(JSON.stringify(metadata));
  try {
    const payEndpoint = "/pg/v1/pay";
    const merchantTransactionId = uniqid();
    const payload = {
      "merchantId": MERCHANT_ID,
      "merchantTransactionId": merchantTransactionId,
      "merchantUserId": id,
      "amount": amount * 100,
      "redirectUrl": `${process.env.API_URL}/login/validate-transaction/${merchantTransactionId}?metadata=${encodedMetadata}`,
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
    if (paymentDetails.data.state == "COMPLETED") {
      const parsedMetadata = JSON.parse(decodeURIComponent(metadata));
      const user = await userinstance.findById(parsedMetadata.user_id);
      if (!user) {
        return res.status(404).json({ baseresponse: { message: "User not found", status: 0 } });
      }
      const updatedWalletBalance =
      parseInt(user.walletBalance) + parseInt(parsedMetadata.addedamount);
      await userinstance.findOneAndUpdate(
        { _id: new ObjectId(parsedMetadata.user_id) },
        {
          $set: {
            walletBalance: updatedWalletBalance,
          },
        },
        { new: true }
      );
      await addTransaction(parsedMetadata.user_id, "Cr", parsedMetadata.addedamount, "Amount added in your wallet");
      res.redirect(`${process.env.WEB_URL}/recharge-success?transactionId=${paymentDetails.data.transactionId}&amount=${paymentDetails.data.amount / 100}`);
    }else{
      res.redirect(`${process.env.WEB_URL}/recharge-failed?message=${paymentDetails.message}&amount=${paymentDetails.data.amount / 100}`);
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
      orderDetails: order.items[0],
      status: "OK",
    });
  } catch (error) {
    return res.status(200).json({
      error: "Error while fetching details ",
      status: "ERROR",
    });
  }
};

const UpdateBalanceForWalletById = async (req, res) => {
  const { _id } = req.params;
  const { amount } = req.body;

  console.log("_id:", _id);
  try {
    // Fetch the user's current wallet balance
    const user = await userinstance.findById(_id);
    if (!user) {
      return res
        .status(404)
        .json({ baseresponse: { message: "User not found", status: 0 } });
    }

    // Calculate the updated wallet balance
    const updatedWalletBalance =
      parseInt(user.walletBalance) + parseInt(amount);
    // Update the user's wallet balance
    const updateUserWallet = await userinstance.findOneAndUpdate(
      { _id: new ObjectId(_id) },
      {
        $set: {
          walletBalance: updatedWalletBalance,
        },
      },
      { new: true }
    );
    addTransaction(_id, "Cr", amount, "Amount added in your wallet");
    if (updateUserWallet !== null) {
      res.status(200).json({
        baseResponse: { message: "Wallet Updated Successfully", status: 1 },
        response: updateUserWallet,
      });
    } else {
      res.status(500).json({
        baseresponse: { message: "Internal Server Error", status: 0 },
      });
    }
  } catch (error) {
    res.status(500).json({
      baseresponse: { message: "Internal Server Error", status: 0 },
    });
  }
};

const ReduceBalanceFromWallet = async (req, res) => {
  const { _id } = req.params;
  const { amount } = req.body;
  try {
    // Fetch the user's current wallet balance
    const user = await userinstance.findById(_id);
    if (!user) {
      return res
        .status(404)
        .json({ baseresponse: { message: "User not found", status: 0 } });
    } else if (user.walletBalance < amount) {
      return res.status(200).json({
        baseresponse: {
          message: "Insufficient balance to deduct balance",
          status: 0,
        },
      });
    }
    const updatedWalletBalance =
      parseInt(user.walletBalance) - parseInt(amount);

    // Update the user's wallet balance
    const updateUserWallet = await userinstance.findOneAndUpdate(
      { _id: _id },
      {
        $set: {
          walletBalance: updatedWalletBalance,
        },
      },
      { new: true }
    );
    addTransaction(_id, "Dr", amount, "Amount deducted in your wallet");
    if (updateUserWallet !== null) {
      res.status(200).json({
        baseResponse: { message: "Wallet Updated Successfully", status: 1 },
        response: updateUserWallet,
      });
    } else {
      res.status(500).json({
        baseresponse: { message: "Internal Server Error", status: 0 },
      });
    }
  } catch (error) {
    res.status(500).json({
      baseresponse: { message: "Internal Server Error", status: 0 },
    });
  }
};

const GetAllAppUser = async (req, res) => {
  try {
    // const findAllUser = await userinstance.find({});
    const findAllUser = await userinstance.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "user._id",
          as: "orders"
        }
      },
      {
        $lookup: {
          from: "transactions",
          localField: "_id",
          foreignField: "user_id",
          as: "transactions"
        }
      },
      {
        $lookup: {
          from: "userrecharges",
          localField: "_id",
          foreignField: "user_id",
          as: "recharges",
          pipeline: [
            {
              $lookup: {
                from: "recharges",
                localField: "recharge_id",
                foreignField: "_id",
                as: "recharge"
              }
            },
            {
              $unwind: {
                path: "$recharge",
                preserveNullAndEmptyArrays: true
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: "transactions",
          localField: "_id",
          foreignField: "user_id",
          as: "transactions"
        }
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "user",
          as: "subscriptions"
        }
      },
      {
        $lookup: {
          from: "vacations",
          localField: "_id",
          foreignField: "user_id",
          as: "vacations"
        }
      },
      {
        $lookup: {
          from: "manualrecharges",
          localField: "_id",
          foreignField: "user_id",
          as: "manualrecharges"
        }
      }
    ]);
    if (findAllUser !== null) {
      res.status(200).json({
        baseResponse: { message: "Users fetched successfully", status: 1 },
        response: findAllUser,
      });
    } else {
      res.status(500).json({
        baseresponse: { message: "Internal Server Error", status: 0 },
      });
    }
  } catch (error) {
    res.status(500).json({
      baseresponse: { message: "Internal Server Error", status: 0 },
    });
  }
};

const updateUserWallet = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { paymentAmount } = req.body;
    const userData = await userinstance.findOneAndUpdate({ _id: user_id }, { walletBalance: paymentAmount }, { new: true });
    if (userData) {
      res.status(200).json({
        baseResponse: { message: "Wallet Amount Updated Successfully", status: 1 },
        response: userData
      });
    } else {
      res.status(200).json({
        baseResponse: { message: "Wallet Amount Can't Updated", status: 0 },
      });
    }
  } catch (error) {
    res.status(500).json({
      baseResponse: { message: "Internal Server Error", status: 0 },
    });
  }
}

const userRecharge = async (req, res) => {
  try {
    const { id } = req.params;
    const { recharge_id } = req.body;
    const user = await userinstance.findOne({ _id: id });
    if (!user) {
      return res.status(404).json({ baseresponse: { message: "User not found", status: 0 } });
    }
    const userrecharge = await userrechargeinstance.create({ user_id: id, recharge_id: recharge_id });
    res.status(200).json({
      baseResponse: { message: "User recharge create successfully", status: 1 },
      response: userrecharge,
    });
  } catch (error) {
    res.status(500).json({
      baseresponse: { message: "Internal Server Error", status: 0 },
    });
  }
};

const checkRechargeValidity = async (req, res) => {
  try {
    const { id } = req.params;
    const lastrecharge = await userrechargeinstance.aggregate([
      {
        $match: {
          user_id: mongoose.Types.ObjectId(id)
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $limit: 1
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "recharges",
          localField: "recharge_id",
          foreignField: "_id",
          as: "recharge"
        }
      },
      {
        $unwind: {
          path: "$recharge",
          preserveNullAndEmptyArrays: true
        }
      }
    ])
    if (!lastrecharge[0]) {
      return res.status(200).json({
        baseresponse: { message: "No recharge found for the user", status: 1 },
      });
    }
    const lastRecharge = lastrecharge[0];
    const currentDate = new Date();
    const rechargeExpiryDate = new Date(lastRecharge.createdAt);
    rechargeExpiryDate.setDate(rechargeExpiryDate.getDate() + parseInt(lastRecharge.recharge.validity));
    // console.log(rechargeExpiryDate,"Sd")
    // console.log(currentDate);

    if (currentDate > rechargeExpiryDate) {
      const userWalletBalance = parseFloat(lastRecharge.user.walletBalance);
      // console.log(userWalletBalance)
      const cashbackAmount = parseFloat(lastRecharge.recharge.cashback);
      // console.log(cashbackAmount)

      if (userWalletBalance >= cashbackAmount) {
        let updatedWalletBalance = userWalletBalance - cashbackAmount;
        await userinstance.updateOne(
          { _id: lastRecharge.user._id },
          { walletBalance: updatedWalletBalance }
        );
        await userrechargeinstance.deleteOne({ _id: lastRecharge._id });
        return res.status(200).json({
          baseresponse: { message: "Cashback amount removed from wallet", status: 1 },
        });
      } else {
        return res.status(200).json({
          baseresponse: { message: "Insufficient wallet balance to remove cashback amount", status: 1 },
        });
      }
    } else {
      return res.status(200).json({
        baseresponse: { message: "Recharge validity has not expired", status: 1, data: lastRecharge },
      });
    }
  } catch (error) {
    res.status(500).json({
      baseresponse: { message: "Internal Server Error", status: 0 },
    });
  }
};


const getLastRecharge = async (req, res) => {
  try {
    const { id } = req.params;
    const lastrecharge = await userrechargeinstance.aggregate([
      {
        $match: {
          user_id: mongoose.Types.ObjectId(id)
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      },
      {
        $limit: 1
      },
      {
        $lookup: {
          from: "recharges",
          localField: "recharge_id",
          foreignField: "_id",
          as: "recharge"
        }
      },
      {
        $unwind: {
          path: "$recharge",
          preserveNullAndEmptyArrays: true
        }
      }
    ])
    if (!lastrecharge[0]) {
      return res.status(200).json({
        baseresponse: { message: "No recharge found for the user", status: 1 },
      });
    }
    res.status(200).json({
      baseresponse: { message: "Last recharge found successfully", status: 1 },
      response: lastrecharge[0]
    });
  } catch (error) {
    res.status(500).json({
      baseresponse: { message: "Internal Server Error", status: 0 },
    });
  }
};

const getAllUsersForUpdation = async (req, res) => {
  try {
    // Fetch all user data from the database
    const getData = await userinstance.find(); // Use find() to get all users

    // If no data is found, return a 404 response
    if (!getData || getData.length === 0) {
      return res.status(404).json({
        baseresponse: {
          message: "No users found",
          status: 0,
          response: [],
        },
      });
    }

    // If data is found, return it with a 200 status code
    res.status(200).json({
      baseresponse: {
        message: "Users fetched successfully",
        status: 1,
        response: getData,
      },
    });

  } catch (error) {
    // Handle any errors that occur during the operation
    res.status(500).json({
      baseresponse: {
        message: "Internal Server Error",
        status: 0,
        error: error.message, // Optional: send the error message for easier debugging
      },
    });
  }
};

const rechargeUserWallet = async (req, res) => {
  try {
    const { id, amount } = req.body; // Extract user ID and amount from the request body

    // Ensure ID and amount are provided
    if (!id || !amount) {
      return res.status(400).json({
        baseresponse: {
          message: "User ID and amount are required",
          status: 0,
        },
      });
    }

    // Find the user by ID and update the wallet balance
    const user = await userinstance.findOne({ _id: id });

    if (!user) {
      return res.status(404).json({
        baseresponse: {
          message: "User not found",
          status: 0,
        },
      });
    }

    // Update user's wallet by adding the recharge amount to the current balance
    user.walletBalance = (typeof user.walletBalance === 'number' ? user.walletBalance : Number(user.walletBalance) || 0) +
      (typeof amount === 'number' ? amount : Number(amount));
    await user.save(); // Save the updated user wallet balance

    // Save the recharge details in the manualrecharge table
    const rechargeData = new manualrechargeinstance({
      user_id: id,  // Correct the field to match the schema (user_id)
      amount: amount, // Save the amount
    });
    await rechargeData.save(); // Save the recharge transaction

    // Send success response
    res.status(200).json({
      baseresponse: {
        message: "Wallet recharged successfully",
        status: 1,
        response: {
          userId: id,
          newWalletBalance: user.walletBalance,
        },
      },
    });

  } catch (error) {
    // Handle any errors that occur during the operation
    res.status(500).json({
      baseresponse: {
        message: "Internal Server Error",
        status: 0,
        error: error.message, // Send the error message for easier debugging
      },
    });
  }
};

const getManualRecharge = async (req, res) => {
  try {
    const currentDate = new Date(); // Get the current date
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0)); // Start of the current day
    const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999)); // End of the current day

    const getData = await manualrechargeinstance.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        }
      },
      {
        $lookup: {
          from: "users", // Replace with the actual users collection name
          localField: "user_id", // Field in manualrechargeinstance
          foreignField: "_id", // Field in users collection
          as: "userDetails"
        }
      },
      {
        $unwind: "$userDetails" // Flatten the userDetails array
      },
      {
        $project: {
          _id: 1,
          amount: 1,
          createdAt: 1,
          "userDetails.name": 1, // Include user name
          "userDetails.walletBalance": 1, // Include user name
          "userDetails.address.location": 1, // Include user email
          // Add other user fields as necessary
        }
      }
    ]);

    res.status(200).json({
      baseresponse: {
        message: "Data fetched successfully",
        status: 1,
        data: getData
      }
    });
  } catch (error) {
    res.status(500).json({
      baseresponse: {
        message: "Internal Server Error",
        status: 0,
        error: error.message, // Optional: send the error message for easier debugging
      },
    });
  }
};




module.exports = {
  authlogin,
  editUserDetails,
  userlogin,
  GenerateOTPWithContact,
  RechargeWallet,
  UpdateBalanceForWalletById,
  getPayIdByOrderId,
  userbyid,
  ReduceBalanceFromWallet,
  GetAllAppUser,
  updateUserWallet,
  userRecharge,
  checkRechargeValidity,
  getLastRecharge,
  getAllUsersForUpdation,
  rechargeUserWallet,
  getManualRecharge,
  ValidateTransaction
};
