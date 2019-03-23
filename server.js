var server = require('http').Server();
var socketServer = require('ws').Server;
var wss = new socketServer({
    server: server,
    port: 8080
});

wss.on('connection', function (client) {
    client.on('message', function (_message) {
    	console.log(_message)
        wss.broadcast(_message);
    });

    // 退出聊天  
    client.on('close', function() {  
        try{
            
        }catch(e){  
            console.log('刷新页面了');  
        }  
    });  
});
//定义广播方法
wss.broadcast = function broadcast(_message) {  
    wss.clients.forEach(function(client) { 
        client.send(_message)
    });  
}; 