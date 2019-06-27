const PUBLICATIONS_PAGE = 0, SAVED_PAGE = 1, TAGGED_PAGE = 2;

var getPageType = function(cb) {
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var currTab = tabs[0];
        
        if (currTab.url.match(/www\.instagram\.com\/.+?\/saved/)) { 
            cb(SAVED_PAGE); 
        }
        else if (currTab.url.match(/www\.instagram\.com\/.+?\/tagged/)) {
            cb(TAGGED_PAGE);
        }
        else {
            cb(PUBLICATIONS_PAGE);
        }
    
    });    
};


var callRemote = function(url, gis, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {            
            callback(xhr);
        }
    };
    
    xhr.open("GET", url, true);   
    if (gis)
        xhr.setRequestHeader("x-instagram-gis", gis);
    xhr.send();
};

var fillUserData = function(data/*, gis*/) {
    
    if (document.getElementById('userPic') != null) { 
        document.getElementById('userPic').src = data.user.profile_pic_url;
    }
    
    if (document.getElementById('userName') != null) { 
        document.getElementById('userName').textContent = data.user.username;
    }
        
    if (document.getElementById('picsNumber') != null) { 
        let amount;
        getPageType(function(page){
            if (page === PUBLICATIONS_PAGE) 
                amount = data.user.edge_owner_to_timeline_media.count;
            else if (page === SAVED_PAGE)
                amount = data.user.edge_saved_media.count;
            else
                amount = '~';
            
            document.getElementById('picsNumber').textContent = amount;
            
            chrome.storage.local.set({        
                'instaUserName': data.user.username,
                'instaUserID': data.user.id,
                'totalMedia': data.user.edge_owner_to_timeline_media.count,
                'endCursor': data.user.edge_owner_to_timeline_media.page_info.end_cursor,
                'page_type': page
            });
    
        });
        
    }   
    
    //getReels(data.user.id, gis);
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

//var getReels = function(userId, rhx) {
//    var usrObj = {
//        "user_id": userId,
//        "include_chaining": true,
//        "include_reel": true,
//        "include_highlight_reels": true
//    };
//    
//    var hashed = md5(rhx + ":" + usrObj);
//    var reelsURL = 'https://www.instagram.com/graphql/query/?query_hash=7c16654f22c819fb63d1183034a5162f&variables=' + JSON.stringify(usrObj);
//    callRemote(reelsURL, hashed, function(req) {
//        var nodes = [];
//        
//        var parsedResp = JSON.parse(req.response); 
//        if (parsedResp.data.user.edge_highlight_reels.edges.length > 0) {
//            parsedResp.data.user.edge_highlight_reels.edges.forEach(function(x) {
//                nodes.push(x.node.id);
//            });
//        }
//        debugger;
//    });
//};


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
                    var user = currTab.url.match(/instagram\.com(\/.+?\/)/)[1];

                    if (/*gis &&*/ user) {
                        let hashedHeader;
                        if (gis)
                            hashedHeader = md5(gis + ":" + user);
                        var url = currTab.url + '?__a=1';
                        callRemote(url, hashedHeader, function(req) {
                           
                            var parsed = JSON.parse(req.response);                           
                            fillUserData(parsed.graphql/*, gis*/);
                        });
                    }
                
                });
               
           
            }
        }
    });
};

//chrome.storage.local.clear();

document.addEventListener('DOMContentLoaded', fetchUserData);