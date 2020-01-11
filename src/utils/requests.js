const request = require('request')

exports.findIP = (url="https://api.ipify.org/?format=json", callback) => {
    request({url: url, json:true}, 
    (error, response, body) => {
      if (error) {
        return callback(error);
      }
      if (response.statusCode !== 200) {
        return callback(new Error('Request failed with code ' + response.statusCode));
      }
      callback(null, body);
    });
}


exports.findLocation = (ip, callback) => {
    let url = 'http://api.db-ip.com/addrinfo?api_key=bc2ab711d740d7cfa6fcb0ca8822cb327e38844f&addr='+ip
    request({url: url, json: true},
        (error, response) => {
            if (error) {
                return callback(error);
            }
            if (response.statusCode !== 200) {
                return callback(new Error('Request failed with code ' + response.statusCode));
            }
            callback(null, response.body.city)
        })

}
