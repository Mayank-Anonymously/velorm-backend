const transactioninstance = require("../model/transaction");
const generateRandomNumericId = () => {
    const prefix = "LAVYA";
    const numericId = Math.floor(100000 + Math.random() * 900000).toString();
    return `${prefix}${numericId}`;
};
const addTransaction= async(user_id,transaction_type,amount,message)=>{
    try{
        await transactioninstance.create({
            user_id,
            transaction_type,
            ref_id:generateRandomNumericId(),
            amount:amount,
            message:message
        });
    } catch (error) {
        console.error("Error creating order:", error.response);
        throw error;
    }
}
module.exports = addTransaction;