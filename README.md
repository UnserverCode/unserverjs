**unserverjs** is a javascript client library for [Unserver - Modbus Communication Software](https://unserver.xyz).

Unserver is a program that acts as an RESTful HTTP API for underlying Modbus networks and offers I/O functionality similar to OPC servers, including:

- polling
- caching
- custom tags
- data type conversion


## Installation
Simply download [unserver.js](https://raw.githubusercontent.com/UnserverCode/unserverjs/master/unserver.js)
And include it into your web page.

## Usage
### Create a Client Instance
    var client = new Unserver('http://127.0.0.1:9000');


### Subscribe to Property Updates

    u.watchProperty('tag1.property1', function(val){
        console.log('new value: ' + val);
    });


### Enable Polling

    u.startPolling(1000);

### Update Property Value

    u.setProperty('tag1.property1', 0);

### Update Property Value With Success and Failure Callbacks

    u.setProperty('tag1.property1', 1, function(){
        console.log("success");
    }, function(){
        console.log("failure");
    });
