const request = require('request');

exports.performFCMApiRequest = async function(registrationIdArr, title, messageBody,messageData)
{
    var responseObj = {};

    console.log('performFCMApiRequest : ', registrationIdArr);
    console.log('messageData : ', messageData);

    try
    {
        var url = 'https://fcm.googleapis.com/fcm/send';
        
        let headers = {
            'Accept': 'application/json',
            'Authorization': 'key=AAAALylEKJQ:APA91bE1f4UjUF-NVFi6W7uJoXr5h7TJqiXDS0YFSOagZaKYNEyN-GMM-5WTJlXRWvyssqeFtAEc4DUYNe4Z4JedPQs8WzJFu7SPoTvtHuB4xibWz_hx3Ptn2TMbWxZ68qgGCvSnGMkh'
        };

        let notification = {
            'title': title,
            'body': messageBody,
            "sound" : "default",      
        };

        let body = {
            "priority": "high",
            "content_available": true,
            "notification" : notification,
            "registration_ids" : registrationIdArr,
            "data" : messageData
        };
        
        var reqOptions = {
            method: 'POST',
            json: true,
            url: url,
            headers: headers,
            body: body,
        };

        let performFCMApiResponse = await exports.performApiRequest(reqOptions);
        console.log('performFCMApiResponse : ', performFCMApiResponse);
        responseObj.performFCMApiResponse = performFCMApiResponse;
    }
    catch(e){
        throw Error('Error Occured while performing get api call ' + e)
    }

    return responseObj;
}

exports.performApiRequest = async function(reqOptions) {
    
    return new Promise(function (resolve, reject) {
        request(reqOptions, function (error, res, body) {
            // console.log('body : ', body)
            // console.log('res : ', res)
            // console.log('error : ', error)

            if (error === null && res.statusCode == 200) {
                try
                {
                    body = JSON.parse(JSON.stringify(body));
                }
                catch(e)
                {
                    body = {};
                }
                resolve((body));
            } else {
                try
                {
                    error = JSON.parse(error);
                }
                catch(e)
                {
                    error = {};
                }
                resolve((error));
            }
        });


    });
}