var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();
app.use(cookieParser());
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var counter = 0;
var chatHist = [];
var userList = [];
var newUser = true;
var available = true;

http.listen( port, function () {
    console.log('listening on port', port);
});

app.get('/', function(req, res, next) {
	if (req.cookie === '') {
		res.cookie('userData' , 'user' + counter++);
	}
    next();
});

app.use(express.static(__dirname + '/public'));



// listen to 'chat' messages
io.on('connection', function(socket){
    for(var i = 0; i < chatHist.length; i++) {
        socket.emit('chat', chatHist[i]); 
    }
    
    for(var i = 0; i < userList.length; i++) {
        socket.emit('userUpdate', userList[i]); 
    }
    
    socket.on('chat', function(msg){
       
        firstParse = msg.split('|');
        var nick = firstParse[0];
        if (nick === '') {
            socket.emit('updateNick', 'Anonymous');
        }
        var nickColor = firstParse[1];
        if (nickColor === '') {
            socket.emit('updateNickColor', '000000');
        }
        var date = new Date();
        var time = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
		parsed = firstParse[2].split(' ');
		if (parsed[0] === '/nick'){
            for (var i = 0; i < userList.length; i++) {
                if (userList[i] === parsed[1]) {
                    socket.emit('chat', time + '|ADMIN|000000|nickname is taken please choose another');
                    available = false;
                    break;
                }
            }
            if (available) {
                for (var i = 0; i < userList.length; i++) {
                    if (userList[i] === nick) {
                        userList[i] = parsed[1]; 
                        newUser = false;
                        break;
                    }
                }
                if (newUser) {
                    userList.push(parsed[1]);
                }
                newUser = true;

                socket.nickname = parsed[1];
                socket.emit('updateNick', parsed[1]);
                io.emit('chat', time + '|ADMIN|000000|' + nick + ' is now know as ' + parsed[1]);
                chatHist.push(time + '|ADMIN|000000|' + nick + ' is now know as ' + parsed[1]);
                if (chatHist.length > 200) {
                    chatHist.shift();
                }
                io.emit('userUpdate', nick + '|' + parsed[1]);
            }
            available = true;
		}else if (parsed[0] === '/nickcolor') {
            socket.emit('updateNickColor', parsed[1]);
        }else {
            
            io.emit('chat', time + '|' + nick + '|' + nickColor + '|' + firstParse[2]);
            chatHist.push(time + '|' + nick + '|' + nickColor + '|' + firstParse[2]);
            if (chatHist.length > 200) {
                chatHist.shift();
            }
        }        
    });
    
    socket.on('disconnect', function() {
        var date = new Date();
        var time = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    for (var i = 0; i < userList.length; i++) {
        if (userList[i] === socket.nickname) {
            io.emit('chat', time + '|ADMIN|000000|User ' + socket.nickname + ' has left');
            io.emit('userLeave', socket.nickname);
            userList.splice(i);
            break;
            }
        }
    });
    
});
