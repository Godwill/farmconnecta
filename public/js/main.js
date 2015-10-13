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
    if(data.result.message !== 'subscribe' || data.result.message !== 'Subscribe' || data.result.message !== 'SUBSCRIBE'){
        $('#listings').prepend(
            "<div class='ui ignored info message'><h3>" + data.result.sender + "<span class='time-ago'>" + jQuery.timeago(data.result.date) + "</span></h3><p>" + data.result.message + "</p></div>"
        );
    } else if(data.result.message === 'subscribe' || data.result.message === 'Subscribe' || data.result.message === 'SUBSCRIBE') {

        $.ajax({
            url: "/api/charge",
            type: "POST",
            data: formData,
            success: function (data, textStatus, jqXHR) {
                console.log(data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    }
});