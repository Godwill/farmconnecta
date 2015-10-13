'use strict';

Pusher.log = function(message) {
    if (window.console && window.console.log) {
        window.console.log(message);
    }
};

var pusher = new Pusher('7ee092bb700c969a086c', {
    encrypted: true
});

var channel = pusher.subscribe('sms_channel');

channel.bind('new_sms', function(data) {
    $('#listings').prepend(
        "<div class='ui ignored info message'><h3>" + data.result.sender + "<span class='time-ago'>" + data.result.date + "</span></h3><p>" + data.result.message + "</p></div>"
    );
});