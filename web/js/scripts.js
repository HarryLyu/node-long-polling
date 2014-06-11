(function () {

    var userID = Math.round(Math.random() * 1000);

    function addToLog(text) {
        $('[data-log]').append(text + '\n');
    }

    var LongPollingTransport = function (data) {
        this.data = data;
    };

    LongPollingTransport.prototype  = {
        establishConnection: function () {
            var self = this;

            $.ajax({
                dataType: 'json',
                type: 'GET',
                url: this.data.url,
                timeout: 10000,
                success: function( data ) {
                    if (data.messages && data.messages.length) {
                        data.messages.forEach(function (el, i) {
                            addToLog(el.eventName + ', data: ' + JSON.stringify(el.data));
                        })
                    }

                    if (data.reconnect) {
                        self.establishConnection();
                    }
                },
                error: function( data ) {
                    addToLog('connection error, sleep');

                },
                complete: function( data ) {

                }
            });
        }
    }

    var transport = new LongPollingTransport({
        url: '//' + location.hostname + ':8443/api/user/' + userID + '/realtime'
    });

    transport.establishConnection();

    $(document.body).on('click', '[data-send]', function () {
        $.ajax({
            dataType: 'json',
            type: 'GET',
            url: '/api/user/' + userID + '/realtime/addMessage',
            data: {
                userID: userID,
                eventName: $('[data-name]').val(),
                data: $('[data-message]').val()
            },
            timeout: 10000,
            success: function( data ) {
                /*$('[data-name]').val('');
                $('[data-message]').val('');*/
            },
            error: function( data ) {
                console.log('error', data);
            },
            complete: function( data ) {

            }
        });
        return false;
    })
})();


