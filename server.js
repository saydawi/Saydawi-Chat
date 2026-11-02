const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.post('/upload', upload.single('file'), (req, res) => {
    res.json({ fileUrl: `/uploads/${req.file.filename}`, fileName: req.file.originalname });
});

const activeUsers = {};

io.on('connection', (socket) => {
    socket.on('login', (username) => {
        activeUsers[socket.id] = username;
        io.emit('updateUserList', Object.values(activeUsers));
    });
    socket.on('join', (room) => socket.join(room));
    socket.on('chat message', (data) => {
        io.to(data.room).emit('chat message', { user: data.user, text: data.text });
    });
    socket.on('disconnect', () => {
        delete activeUsers[socket.id];
        io.emit('updateUserList', Object.values(activeUsers));
    });
});

http.listen(3000, () => console.log('Saydawi Chat (M3 Expressive) running on http://localhost:3000'));