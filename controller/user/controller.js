const { ObjectId } = require("mongodb");
const orderinstance = require("../../model/order");
const useraddress = require("../../model/useraddress");
const userinstance = require("../../model/user");

const FetchSubscriptionByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const findsubscription = await orderinstance.find({
      "user._id": userId,
      "product.subscription_active": true,
      // status: {
      //   $nin: ["CANCELLEDBYCUSTOMER", "CANCELLEDBYADMIN", "CANCELLEDBYPARTNER"],
      // },
    }).sort({createdAt:-1})

    if (userId !== "" && findsubscription.length !== 0) {
      res.status(200).json({
        baseResponse: {
          message: "Subscription Found Successfully ",
          status: 1,
        },
        response: findsubscription,
      });
    } else {
      res.status(200).json({
        baseResponse: {
          message: "Bad Request",
          status: 0,
        },
        response: [],
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      baseResponse: {
        message: "Some Error Occurred",
        status: 0,
      },
      response: [],
    });
  }
};

const FetchOrderByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const findsubscription = await orderinstance.find({
      "user._id": userId,
      "product.subscription_active": false,
    }).sort({createdAt:-1})

    if (userId !== "" && findsubscription.length !== 0) {
      res.status(200).json({
        baseResponse: {
          message: "Orders Found Successfully ",
          status: 1,
        },
        response: findsubscription,
      });
    } else {
      res.status(200).json({
        baseResponse: {
          message: "Bad Request",
          status: 0,
        },
        response: [],
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      baseResponse: {
        message: "Some Error Occurred",
        status: 0,
      },
      response: [],
    });
  }
};

const SaveNewAddress = async (req, res) => {
  const { location, street, address, landmark, alternatephone } = req.body;
  const { userId } = req.params;
  const newAddress = await new useraddress({
    location,
    street,
    address,
    landmark,
    alternatephone,
    userId,
  });

  if (userId !== "") {
    res.status(200).json({
      baseResponse: { message: "Address Saved Successfully", status: 1 },
      response: await newAddress.save(),
      updatedDetails: await userinstance.findOneAndUpdate(
        { _id: userId },
        {
          $set: {
            address: {
              location,
              street,
              address,
              landmark,
              alternatephone,
            },
            more_address: [
              {
                location,
                street,
                address,
                landmark,
                alternatephone,
              },
            ],
          },
        },
        { new: true }
      ),
    });
  } else {
    res.status(200).json({
      baseResponse: { message: "Something went wrong", status: 0 },
    });
  }
};

const editUserAddress = async (req, res) => {
  const { address_id } = req.params;
  const { location, street, address,  landmark, alternatephone} = req.body;
  try{
    const data = {
      location:location,
      street:street,
      address:address,
      landmark:landmark,
      alternatephone:alternatephone
    }
    console.log(data)
    const editaddress = await useraddress.findOneAndUpdate({_id:address_id},data,{new:true});
    if(editaddress){
      res.status(200).json({
        baseResponse: { message: "Address edit Successfully", status: 1 },
        response: editaddress,
      });
    }else{
      res.status(200).json({ message: "address not edited" });
    }
  }catch(error){
    res.status(500).json({ message: "Internal server error" });

  }
};

const GetNewAddress = async (req, res) => {
  const { userId } = req.params;

  try {
    const newAddresses = await useraddress.find({ userId: userId });

    if (newAddresses && newAddresses.length > 0) {
      res.status(200).json({
        baseResponse: { message: "Addresses Found Successfully", status: 1 },
        response: newAddresses,
      });
    } else {
      res.status(404).json({
        baseResponse: { message: "No Addresses Found for the User", status: 0 },
      });
    }
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({
      baseResponse: { message: "Internal Server Error", status: 0 },
    });
  }
};

const checkSubscriptionofUser = async (req, res) => {
  try {
    // const userId = "65d1f626ff18d2796fc71370"; // Assuming the user ID is passed as a parameter
    const { userId } = req.params; // Assuming the user ID is passed as a parameter
    const user = await userinstance.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      membership_active,
      membership_plan_discount,
      membership_plan_value,
      membership_subscription,
    } = user;

    // Parse subscription date into day, month, and year
    const [day, month, year] = membership_subscription.split("-").map(Number);

    // Create a Date object using the parsed components
    const subscriptionDate = new Date(year, month - 1, day); // Note: Month is 0-indexed in JavaScript Date object

    const validityDays = parseInt(user.membershipValidity);
    const expiryDate = new Date(subscriptionDate);
    expiryDate.setDate(expiryDate.getDate() + validityDays);

    // Add validity days to the subscription date
    const thirtiethDate = new Date(subscriptionDate);
    thirtiethDate.setDate(subscriptionDate.getDate() - validityDays);

    // Calculate the difference in days between today's date and the thirtieth date
    const today = new Date();
    const differenceInMilliseconds = thirtiethDate - today;
    let differenceInDays = Math.ceil(
      differenceInMilliseconds / (1000 * 60 * 60 * 24)
    );

    // Check if subscription has expired
    differenceInDays = JSON.stringify(differenceInDays);
    differenceInDays = differenceInDays.replace("-", "");
    differenceInDays = parseInt(differenceInDays);

    const isExpired =
      differenceInDays === 0 || differenceInDays === null ? false : true;

    const subscriptionDetails = {
      membership_active,
      membership_plan_value,
      membership_plan_discount,
      membership_subscription,
      remainingDays: differenceInDays,
      isExpired,
    };

    if (differenceInDays === 0) {
      await userinstance.findOneAndUpdate(
        {
          _id: new ObjectId(user._id),
        },
        {
          $set: {
            membership_active: false,
            membership_plan_discount: "",
            membership_plan_value: "",
            membership_subscription: "",
            membership_thirtieth_date: "",
          },
        }
      );
    }
    res.status(200).json({
      baseResponse: { message: "SUCCESS", status: 1 },
      response: { user, subscriptionDetails },
    });
  } catch (error) {
    console.error("Error retrieving user subscription:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// const expirysubscriptonbyvalue = (req, res) => {

// };

module.exports = {
  FetchSubscriptionByUser,
  SaveNewAddress,
  editUserAddress,
  GetNewAddress,
  FetchOrderByUser,
  checkSubscriptionofUser,
};
