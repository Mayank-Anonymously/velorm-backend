const mongoose = require("mongoose");
const mongooseserial = require("mongoose-serial");

const usersubscribe = new mongoose.Schema(
    {
        email:{
            type:String,
            require:true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const usersubscribeinstance = new mongoose.model("usersubscribe", usersubscribe);
module.exports = usersubscribeinstance;
