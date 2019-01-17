chrome.tabs.onUpdated.addListener(function(tabId, changeinfo, tab) {  
    if (changeinfo && changeinfo.status == "complete") {       
        chrome.tabs.executeScript(tabId, {file: "js/instaSaveObj.js"}, function(){
                chrome.tabs.executeScript(tabId, { file: "js/rhx_gis.js" }, function() {                     
                });           
        });      
    }
});


function changeHeaders(details) {
       
    if (details.url.indexOf('https://www.instagram.com/') !== -1)          
        
        var headers = details.responseHeaders;
        for (var j = 0, jLen = headers.length; j !== jLen; ++j) {
            var header = headers[j];
            var name = header.name.toLowerCase();
            if (name !== "content-security-policy" &&
                name !== "content-security-policy-report-only" &&
                name !== "x-webkit-csp") {
                continue;
            }
            
            header.value = header.value.replace('worker-src', 'worker-src blob:');
            
        }
        return {responseHeaders: headers};
    
}


chrome.webRequest.onHeadersReceived.addListener(changeHeaders, {
    urls: ["*://*/*"],
    types: ["main_frame", "sub_frame"]
}, ["blocking", "responseHeaders"]);