const transactioninstance = require("../../model/transaction");
const getTransactionById = async(req,res)=>{
    try {
        const {userId} = req.params;
        const transactions = await transactioninstance.find({user_id:userId}).sort({_id:-1})
        res.status(200).json({
            baseResponse: {
                message: "Transaction details fetched successfully",
                status: 1,
            },
            response: transactions,
        });
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
}

module.exports = {getTransactionById}