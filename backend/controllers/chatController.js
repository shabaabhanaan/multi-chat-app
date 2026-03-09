const getMessages = async (req, res) => {
    res.send('Get messages route');
};

const sendMessage = async (req, res) => {
    res.send('Send message route');
};

module.exports = {
    getMessages,
    sendMessage
};
