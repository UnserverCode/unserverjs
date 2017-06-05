This is a javascript client library for [Unserver - Modbus Communication Software](https://unserver.xyz).

Unserver acts as an RESTful HTTP API for underlying Modbus networks and offers functionality similar to OPC servers,
such as polling, caching, tags and data type conversion.



## Create a Client Instance
    var client = new Unserver('http://127.0.0.1:9000');


## Subscribe a Callback to a Property

    u.watchProperty('tag1.property1', function(val){
        console.log('new value: ' + val);
    });


## Enable Polling to Start Watching Updates

    u.startPolling(1000);

## Set Property Value Without Callbacks

    u.setProperty('tag1.property1', 0);

## Set Property Value With Callbacks

    u.setProperty('tag1.property1', 1, function(){
        console.log("success");
    }, function(){
        console.log("failure");
    });
