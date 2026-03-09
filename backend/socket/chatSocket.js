const chatSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected', socket.id);

        socket.on('join_room', (data) => {
            socket.join(data);
            console.log(`User ${socket.id} joined room ${data}`);
        });

        socket.on('send_message', (data) => {
            socket.to(data.room).emit('receive_message', data);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected', socket.id);
        });
    });
};

module.exports = chatSocket;
