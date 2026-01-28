const axios = require("axios");
const sendDirectMessage = async (contact,templateId,message) => {
    // Encode the message
    const encodedMessage = encodeURIComponent(message);

    const config = {
        method: "get",
        url: `http://alwar.smsalwar.in/vb/apikey.php?apikey=DX3uToPiTxpg5r8K&senderid=LAVYAG&number=${contact}&templateId=${templateId}&message=${encodedMessage}`,
        headers: {},
    };

    try {
        const apiFetch = await axios(config);
        console.log("API Response:", apiFetch.data);
        if (apiFetch.data.status === "Success") {
            console.log("Message submitted successfully.");
        } else {
            console.error("Message submission failed:", apiFetch.data.description);
        }
        return apiFetch.data;
    } catch (error) {
        console.error("Error sending message:", error);
    }

};
module.exports = sendDirectMessage;