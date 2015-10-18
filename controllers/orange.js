var request = require('request'),
    secrets = require('./../secrets/secrets');


var orange = {

    chargeUser : function(data){

        var usernum = data.senderAddress.substr(7);

        var postData = {
            "endUserId":"tel:+99" + usernum,
            "transactionOperationStatus":"Charged",
            "chargingInformation":{
                "description":"Test chargeAmount for the challenge documentation",
                "amount":5,
                "currency":"XOF"
            },
            chargingMetaData:{
                "serviceID":"Test ServiceID #1",
                "productID":"Test ProductID #1"
            },
            "referenceCode":"REF-TestReference" + data.messageId,
            "clientCorrelator":"TestReference"  + data.messageId
        };

        request({
            method: 'POST',
            uri: 'https://api.sdp.orange.com/payment/v1/tel%3A%2B' + usernum + '/transactions/amount',
            headers: {
                'Authorization': 'Bearer ' + secrets.orange.token,
                'content-type': 'application/json'
            },
            json : postData
        }, function (error, response, body) {
            if(response.statusCode == 201){
                console.log("The response: ", response)
            } else {
                console.log('error: '+ response.statusCode)
                console.log(body)
            }
        })
    },

    sendSMS : function(usernum, message){

        var postData = {
            "address":["tel:+99" + usernum],
            "senderName":"FarmConnecta",
            "message": message
        };

        request({
            method: 'POST',
            uri: 'https://api.sdp.orange.com/smsmessaging/v1/outbound/tel%3A%2B' + usernum + '/requests',
            headers: {
                'Authorization': 'Bearer ' + secrets.orange.token,
                'content-type': 'application/json'
            },
            json : postData
        }, function (error, response, body) {
            console.log();
            if(response.statusCode == 201){
                console.log("The response: ", response.body)
            } else {
                console.log('error: '+ response.statusCode);
                console.log(body);
            }
        })
    }

};

module.exports = orange;