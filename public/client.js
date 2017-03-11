var userList = [];

//function for geting cookie data (code adapted from w3schools)
function getCookieValue(index) {
    var indexValue = index + "=";
    var cookie = decodeURIComponent(document.cookie);
    var parse = cookie.split(';');
    for (var i = 0; i < parse.length; i++) {
        var checker = parse[i];
        while (checker.charAt(0) == ' ') {
            checker = checker.substring(1);
        }
        if (checker.indexOf(indexValue) == 0) {
            return checker.substring(indexValue.length, checker.length);
        }
    }
    return "";
}

// shorthand for $(document).ready(...)
$(function() {
    var socket = io();
    var messages = document.getElementById('messages');
    $('form').submit(function(){
	socket.emit('chat', getCookieValue("nick") + '|' + getCookieValue("nickColor") + '|' + $('#m').val());
	$('#m').val('');
	return false;
    });
    
    socket.on('chat', function(msg){
        parsed = msg.split('|');
        time = '<li>' + parsed[0] + ' ';
        nickname = parsed[1].fontcolor(parsed[2]) + ': ';
        if (parsed[1] === getCookieValue("nick")) {
            chatMsg = parsed[3].bold() + '</li>';
        }else {
            chatMsg = parsed[3] + '</li>';
        }
        mess = time + nickname + chatMsg;
    $('#messages').append(mess);
    var messScroll = document.getElementById('messTab');
        messScroll.scrollTop = messScroll.scrollHeight;
        
    });
    
    socket.on('userUpdate', function(msg){
        var newUser = true;
        parsed = msg.split('|');
        for (var i = 0; i < userList.length; i++) {
                if (userList[i] === parsed[0]) {
                    userList[i] = parsed[1]; 
                    newUser = false;
                    break;
                }
            }
            if (newUser) {
                userList.push(parsed[1]);
            }
        $('#users').empty();
        for (var i = 0; i < userList.length; i++) {
            username = '<li>' + userList[i] + '</li>';
            $('#users').append(username);
        }
    });
    
    socket.on('userLeave', function(msg){
        for (var i = 0; i < userList.length; i++) {
                if (userList[i] === msg) { 
                    userList.splice(i);
                }
            }
        $('#users').empty();
        for (var i = 0; i < userList.length; i++) {
            username = '<li>' + userList[i] + '</li>';
            $('#users').append(username);
        }
    });
    
    socket.on('updateNick', function(msg){
	document.cookie = "nick=" + msg;
    });
    
    socket.on('updateNickColor', function(msg){
	document.cookie = "nickColor=" + msg;
    });
});
