const messageModel = require("../Models/message-model");

//create message
const createMessage = async (req, res) => {
    const { chatId, senderId, text } = req.body;

    const message = new messageModel({
        chatId, senderId, text,
    });

    try {
        const response = await message.save();
        // console.log('response');
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

//get messages
const getMessages = async (req, res) => {
    const { chatId } = req.params;
    // console.log('chatId', chatId);
    // console.log('res', res);

    try {
        const messages = await messageModel.find({ chatId });
        // console.log('messages', messages);
        res.status(200).json(messages);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

module.exports = { createMessage, getMessages };