var callRemote = function(url, gis, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {            
            callback(xhr);
        }
    };
    
    xhr.open("GET", url, true);   
    xhr.setRequestHeader("x-instagram-gis", gis);
    xhr.send();
};

var fillUserData = function(data) {
    
    if (document.getElementById('userPic') != null) { 
        document.getElementById('userPic').src = data.user.profile_pic_url;
    }
    
    if (document.getElementById('userName') != null) { 
        document.getElementById('userName').textContent = data.user.username;
    }
        
    if (document.getElementById('picsNumber') != null) { 
        document.getElementById('picsNumber').textContent = data.user.edge_owner_to_timeline_media.count;
    }
    
    chrome.storage.local.set({        
        'instaUserName': data.user.username,
        'instaUserID': data.user.id,
        'totalMedia': data.user.edge_owner_to_timeline_media.count,
        'endCursor': data.user.edge_owner_to_timeline_media.page_info.end_cursor
    });
};

var saveMedia = function() {
    chrome.tabs.executeScript({file: 'js/jquery-3.1.1.min.js'});  
    chrome.tabs.executeScript({file: 'js/spin.min.js'});
    chrome.tabs.executeScript({file: 'js/moment.js'});
    chrome.tabs.executeScript({file: "js/zip.js"});        
    chrome.tabs.executeScript({file: "js/deflate.js"});
    chrome.tabs.executeScript({file: "js/patch-worker.js"});
    chrome.tabs.executeScript({file: "js/FileSaver.min.js"});
    chrome.tabs.executeScript({file: 'js/md5.js'});  
    chrome.tabs.executeScript({file: 'js/instaSaveObj.js'});     
    chrome.tabs.executeScript({file: 'js/instaSaver.js'}); 
};


var fetchUserData = function() {
        
    if (document.getElementById('saveMedia') != null) { 
        document.getElementById('saveMedia').addEventListener('click', saveMedia);
    } 
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {        
        var currTab = tabs[0];
        if (currTab) { 
            
            if (currTab.url.indexOf('instagram.com') !== -1) {
                                
                document.getElementById('cont').style.display = 'block';
                
                chrome.storage.local.get(null, function (items) {  

                    var gis = items.rhx_gis;
                    var user = currTab.url.match(/instagram\.com(\/.+\/)/)[1];

                    if (gis && user) {
                        var hashedHeader = md5(gis + ":" + user);
                        var url = currTab.url + '?__a=1';
                        callRemote(url, hashedHeader, function(req) {
                           
                            var parsed = JSON.parse(req.response);
                            fillUserData(parsed.graphql);
                        });
                    }
                
                });
               
           
            }
        }
    });
};



document.addEventListener('DOMContentLoaded', fetchUserData);