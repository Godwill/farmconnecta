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
    console.log(data.listing);
});