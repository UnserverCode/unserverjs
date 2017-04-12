
// create an client instance
var u = new Unserver('http://192.168.1.47:9000');

// dummy callbacks
function success(){ console.log('success'); }
function failure(){ console.log('failure'); }

// subscribe to callback to property
u.watchProperty('t1.p1', function(val){
    console.log('new value: ' + val);
});

// enable polling of watched properties
u.startPolling(1000);

// set property without callbacks
u.setProperty('t1.p1', 0);

// set property with callbacks
u.setProperty('t1.p1', 1, success, failure);
