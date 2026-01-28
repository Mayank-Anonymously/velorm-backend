const mongoose = require("mongoose");
const mongooseserial = require("mongoose-serial");

const userrecharge = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            require:true
        },
        recharge_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "recharge",
            require:true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const userrechargeinstance = new mongoose.model("userrecharge", userrecharge);
module.exports = userrechargeinstance;
