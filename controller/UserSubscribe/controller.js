const usersubscribeinstance = require("../../model/user_subscribe");
const userSubscribe = async (req, res) => {
    try {
        const { email } = req.body;
        const data = {
            email: email
        }
        const user = await usersubscribeinstance.create(data);
        if (!user) {
            return res.status(500).json({
                baseResponse: {
                    message: "Some Error Occurred",
                    status: 0,
                }
            });
        }
        res.status(200).json({
            baseResponse: {
                message: "User subscribe Successfully ",
                status: 1,
            },
            response:user
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            baseResponse: {
                message: "Some Error Occurred",
                status: 0,
            }
        });
    }
};

const getAllSubscribeUser = async (req, res) => {
    try {
        const alluser = await usersubscribeinstance.find({});
        res.status(200).json({
            baseResponse: {
                message: "subscribe user fetch Successfully",
                status: 1,
            },
            response:alluser
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            baseResponse: {
                message: "Some Error Occurred",
                status: 0,
            }
        });
    }
};

module.exports = { userSubscribe,getAllSubscribeUser }