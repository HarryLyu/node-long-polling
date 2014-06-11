var express = require('express');

var app = express(),
    port = 8443;

var messagesQueue = [];

app.get('/api/user/:userID/realtime/addMessage', function(req, res){
    var userID = req.params.userID,
        eventName = req.query.eventName,
        data = req.query.data;

    try {
        data = JSON.parse(data);
    }
    catch(e){}

    messagesQueue.push({
        userID: userID,
        eventName: eventName,
        data: data
    });

    res.send(200, {result: true, messagesQueueLength: messagesQueue.length});
    res.end();
});

app.get('/api/user/:userID/realtime', function(req, res){
    var startRequestTime = (new Date()).getTime(),
        userID = req.params.userID,
        data;

    longPollingWhile:
        while ((new Date()).getTime() - startRequestTime < 4000) {
            for (var i = 0; i < messagesQueue.length; i++) {
                if (messagesQueue[i].userID == userID) {
                    var messagesToSend = [];
                    messagesToSend.push(messagesQueue[i]);
                    data = {messages: messagesToSend, reconnect: true};
                    messagesQueue.splice(i, 1);
                    break longPollingWhile;
                }
            }
        }

    if (!data) {
        data = {messages: [], reconnect: true};
    }

    res.send(200, data);
    //res.code(404);
});

app.use('/static', express.static(__dirname + '/web'));

app.listen(port);
console.log('Express started on port ' + port);