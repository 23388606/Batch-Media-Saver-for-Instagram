chrome.tabs.onUpdated.addListener(function(tabId, changeinfo, tab) {  
    if (changeinfo && changeinfo.status == "complete") {       
        chrome.tabs.executeScript(tabId, {file: "js/instaSaveObj.js"}, function(){
                chrome.tabs.executeScript(tabId, { file: "js/rhx_gis.js" }, function() {                     
                });           
        });      
    }
});