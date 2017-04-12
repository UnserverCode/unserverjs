var Unserver = (function(){
    var http={DEFAULTS:{async:!0,contentType:"text/plain",data:null,headers:{},method:"GET",onerror:function(){},onload:function(){},onreadystatechange:function(){},ontimeout:function(){},url:"./",props:[]},DEFAULT_PROPS:["onload","onerror","onreadystatechange","ontimeout"],request:function(e){for(var e=this.options(e),t=new XMLHttpRequest,n=0;n<e.props.length;n++){var r=e.props[n];t[r]=e[r]}t.timeout=2000;t.open(e.method,e.url,e.async);for(var r in e.headers)e.headers.hasOwnProperty(r)&&t.setRequestHeader(r,e.headers[r]);return t.setRequestHeader("Content-Type",e.contentType),t.send(e.data),t},options:function(e){for(var t={},n=this.DEFAULTS,r=Object.keys(e).concat(Object.keys(n)),o=0;o<r.length;o++){var s=r[o];t[s]=e[s]||n[s]}return t.props=t.props.concat(this.DEFAULT_PROPS),t},get:function(e){return this.request(e)},post:function(e){return e.method="POST",this.request(e)},put:function(e){return e.method="PUT",this.request(e)}};

    var Watcher = (function(){
            function ctor(tag, property){
                var listeners = [];
                
                function addListener(onNewValue){
                    if (typeof(onNewValue) !== "function")
                        throw new TypeError();

                    listeners.push(onNewValue);
                }

                function newValue(value){
                    listeners.forEach(function(x){x(value);});
                }

                function key(){
                    return JSON.stringify({t:tag, p:property});
                }

                return {
                    addListener: addListener,
                    newValue: newValue,
                    tag: tag,
                    property: property,
                    key: key
                }
            }
            ctor.computeKey = function(tag,property){
                return JSON.stringify({t:tag, p:property});
            }
            return ctor;
    })();

    function ctor(unserverUrl){
        var _interval = 1000;
        var _url = unserverUrl;
        var watchedTags = {};
        var watchedProperties = {};
        var errorWatcher = new Watcher();

        var poll = (function(callback){
            var isRunning = false;

            function loop(){
                if(isRunning){
                    callback();
                    setTimeout(loop, _interval);
                }
            }

            function start(interval){
                if(!isRunning){
                    _interval = interval;
                    setTimeout(loop, _interval);
                    isRunning = true;
                }
            }
            function stop(){
                isRunning = false;
            }
            return{
                start:start,
                stop:stop
            }
        })(updateAllTags);

        function updateAllTags(){
            for (wt in watchedTags){
                (function(t){
                    http.get({
                        url: _url + '/tags/' + watchedTags[t].tag,
                        onload: function() { 
                            var responseJson = JSON.parse(this.responseText);
                            var tagData = responseJson.data;

                            if (tagData){
                                watchedTags[t].newValue(tagData);
                                for(p in tagData){
                                    var pk = Watcher.computeKey(watchedTags[t].tag, p);
                                    if (watchedProperties.hasOwnProperty(pk)){
                                        watchedProperties[pk].newValue(tagData[p]);
                                    }
                                }
                            }
                        },
                        onerror: function(e) {
                            errorWatcher.newValue(e);
                        }
                    });
                })(wt);
            }
        }

        function setProperty(propertyPath, value, callback, error){
            var tag = propertyPath.split('.')[0];
            var property = propertyPath.split('.')[1];
            http.put({
                url: _url + '/tags/' + tag + '/properties/' +  property,
                data: JSON.stringify({value:value}),
                contentType: 'application/json',
                onload: function(){ 
                    callback && callback(); 
                },
                onerror: function(e){ 
                    error && error(); 
                },
                ontimeout: function(){
                    error && error();
                }
            });
        }

        function watchTag(tag, onNewValue){
            var tagWatcherKey = Watcher.computeKey(tag);
            if(!watchedTags.hasOwnProperty(tagWatcherKey)){
                watchedTags[tagWatcherKey] = new Watcher(tag);
            }
            onNewValue && watchedTags[tagWatcherKey].addListener(onNewValue);
        }

        function watchProperty(propertyPath, onNewValue){
            var tag = propertyPath.split('.')[0];
            var property = propertyPath.split('.')[1];
            var pk = Watcher.computeKey(tag, property);
            if(!watchedProperties.hasOwnProperty(pk)){
                watchedProperties[pk] = new Watcher(tag, property);
            }
            watchedProperties[pk].addListener(onNewValue);

            watchTag(tag);
        }

        function watchError(listener){
            listener && errorWatcher.addListener(listener);
        }

        function unwatchProperty(tag, property){
            delete watchedProperties[Watcher.computeKey(tag,property)];
        }

        return{
            startPolling: function(intervalMs){
                poll.start(intervalMs);
            },
            stopPolling: function(){poll.stop();},
            watchTag:watchTag,
            watchProperty:watchProperty,
            watchError: watchError,
            unwatchProperty:unwatchProperty,
            setProperty: setProperty,
        }
    }
    return ctor;
})();
