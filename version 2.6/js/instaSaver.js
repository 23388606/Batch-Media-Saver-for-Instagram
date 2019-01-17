var initSpin = function() {
    var overlay = document.createElement('div');
    overlay.id = '__over';
    overlay.setAttribute('style', 'position:fixed;top:0;left:0;width:100%;height:100%;background:#000;opacity:0.2;');
    document.body.appendChild(overlay);
    
    var lbl = document.createElement('p');
    lbl.id = '__infoText';
    lbl.setAttribute('style', 'position:fixed;top:50%;left:50%;width:260px;transform: translateX(-50%) translateY(-50%);font-family:Roboto,Helvetica Neue,Helvetica,Arial,sans-serif;font-size: 3em;color:#ffffff;line-height:1em;text-align: center;');
    lbl.textContent = 'Getting info from Instagram...';
    document.body.appendChild(lbl);
    
    var opts = {lines:56,length:27,width:5,radius:150,corners:1,rotate:0,direction:1,color:'#ffffff',speed:1,trail:60,shadow: false,hwaccel:false,className:'spinner',zIndex:2e9,top:'50%',left:'50%',position:'fixed'};   
     
    return new Spinner(opts);
};

var stopSpin = function() {
    spinner.stop();
    var overlay = document.getElementById('__over');
    if (overlay)
        overlay.parentNode.removeChild(overlay);
    var info = document.getElementById('__infoText');
    if (info)
        info.parentNode.removeChild(info);
};

var downloadMedia = function(cb) {
    
    var patternForExtension = /\.([0-9a-z]+)(?:[\?#]|$)/i;
    
    chrome.storage.local.get(null, function(items) {  
    
        var media = InstaSaver.getAllMedia(); 
        
        // if the user set the date range, download only pictures in this range
        if (items.lastTS && items.firstTS) {
            
            media = media.filter(function(i) {
                return i.node.taken_at_timestamp >= items.firstTS && i.node.taken_at_timestamp < items.lastTS;
            }); 
        }


        if (media.length == 0) {
            document.getElementById('__infoText').textContent = 'No data...';
            setTimeout(function() {
                stopSpin();
            },2000);
        }

        //data.data.user.edge_owner_to_timeline_media.edges;        
        var requestsCount = 0;
        
        
        InstaSaver.getStories().forEach(function(x) {
            var name = "story_" + moment.unix(x.taken_at_timestamp).format("YYYY-MM-DD") + '_' + x.id;
            var src;
            
            if (x.__typename === "GraphStoryVideo") {
                src = x.video_resources.filter(x => x.profile === "MAIN")[0].src;                
                name += '.' + src.match(patternForExtension)[1];                   
                InstaSaver.addZipItem({name: name, url: src});
            }
            else if (x.__typename === "GraphStoryImage") {
                name += '.' + x.display_url.match(patternForExtension)[1];  
                InstaSaver.addZipItem({name: name, url: x.display_url});
            }
            
        });

        
        for (var i = 0; i < media.length; i++) {
            (function(i) {
                var curMediaItem = media[i].node;
                if (curMediaItem.__typename === 'GraphImage') {    


                    var imgDate = moment.unix(curMediaItem.taken_at_timestamp).format("YYYY-MM-DD");
                    var imgExt = curMediaItem.display_url.match(patternForExtension)[1];                
                    var imgName = imgDate + '_' + curMediaItem.id + '.' + imgExt;

                    InstaSaver.addZipItem({name: imgName, url: curMediaItem.display_url});
                    
                    
                    // saving comments
                    if (items.saveComments == 'true') {
                        
                         $.ajax({
                             type: 'GET',
                             url: 'https://www.instagram.com/p/' + curMediaItem.shortcode + '/?__a=1',                              
                             success: function(data){ 
                                 
                                 var curPic = data.graphql.shortcode_media;
                                 var comments = [];
                                 
                                 if (curPic.edge_media_to_caption.edges.length > 0) {                                    

                                    comments.push({
                                        user: curPic.owner.username,
                                        text: curPic.edge_media_to_caption.edges[0].node.text  
                                    });
                                 }
                                 
                                 for (var i = 0; i < curPic.edge_media_to_comment.edges.length; i++) {
                                    comments.push({
                                        user: curPic.edge_media_to_comment.edges[i].node.owner.username,
                                        text: curPic.edge_media_to_comment.edges[i].node.text  
                                    });
                                 }                            
                                 
                                 if (comments.length > 0) {
                                     var stringJSON = JSON.stringify(comments);

                                     InstaSaver.addZipItem({
                                        name: moment.unix(curPic.taken_at_timestamp).format("YYYY-MM-DD") + '_' + curPic.id + '.json', 
                                        data: stringJSON,     
                                     }); 
                                     // end saving comments
                                 }
                                 
                                 requestsCount++;   
                                 if (requestsCount === media.length)
                                    cb();
                                 
                             }
                         });                        
                    }
                    else {
                        requestsCount++;   
                        if (requestsCount === media.length)
                        cb();
                    }

                }
                else if (curMediaItem.__typename === 'GraphVideo') {

                    $.ajax({
                        type: 'GET',
                        url: 'https://www.instagram.com/p/' + curMediaItem.shortcode + '/?__a=1',  
                        success: function(data){  

                            var curVideoItem = data.graphql.shortcode_media;
                            var videoDate = moment.unix(curVideoItem.taken_at_timestamp).format("YYYY-MM-DD");
                            var videoExt = curVideoItem.video_url.match(patternForExtension)[1];
                            var videoName = videoDate + '_' + curVideoItem.id + '.' + videoExt;

                            InstaSaver.addZipItem({name: videoName, url: curVideoItem.video_url});  
                            
                            
                            // saving comments
                            if (items.saveComments == 'true') {
                                var comments = [];
                                if (curVideoItem.edge_media_to_caption.edges.length > 0) {
                                    
                                    comments.push({
                                        user: curVideoItem.owner.username,
                                        text: curVideoItem.edge_media_to_caption.edges[0].node.text  
                                    });
                                }

                                for (var i = 0; i < curVideoItem.edge_media_to_comment.edges.length; i++) {
                                    comments.push({
                                        user: curVideoItem.edge_media_to_comment.edges[i].node.owner.username,
                                        text: curVideoItem.edge_media_to_comment.edges[i].node.text  
                                    });
                                }                            

                                if (comments.length > 0) {
                                    var stringJSON = JSON.stringify(comments);

                                    InstaSaver.addZipItem({
                                        name: videoDate + '_' + curVideoItem.id + '.json', 
                                        data: stringJSON,     
                                    });    
                                }
                            }
                            // end saving comments

                            requestsCount++;                        
                            if (requestsCount === media.length)
                                cb();

                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) {             
                            //debugger;
                        }
                    });  
                }
                // several pics in one post
                else if (curMediaItem.__typename === 'GraphSidecar') {

                    $.ajax({
                        type: 'GET',
                        url: 'https://www.instagram.com/p/' + curMediaItem.shortcode + '/?__a=1',  
                        success: function(data){  

                            var sideCarItem = data.graphql.shortcode_media;
                            var sideCarDate = moment.unix(sideCarItem.taken_at_timestamp).format("YYYY-MM-DD");

                            for (var i = 0; i < sideCarItem.edge_sidecar_to_children.edges.length; i++) {

                                var curCarItem = sideCarItem.edge_sidecar_to_children.edges[i].node;                                
                                var curUrl = (curCarItem.is_video ? curCarItem.video_url : curCarItem.display_url);
                                var curExt = curUrl.match(patternForExtension)[1];
                                var curPicName = sideCarDate + '_' + curCarItem.id + '.' + curExt;

                                InstaSaver.addZipItem({
                                    name: curPicName, 
                                    url: curUrl     
                                }); 
                            }
                            
                            if (items.saveComments == 'true') {
                                // saving comments
                                var comments = [];
                                if (sideCarItem.edge_media_to_caption.edges.length > 0) {
                                    
                                    comments.push({
                                        user: sideCarItem.owner.username,
                                        text: sideCarItem.edge_media_to_caption.edges[0].node.text  
                                    });
                                }

                                for (var i = 0; i < sideCarItem.edge_media_to_comment.edges.length; i++) {
                                    comments.push({
                                        user: sideCarItem.edge_media_to_comment.edges[i].node.owner.username,
                                        text: sideCarItem.edge_media_to_comment.edges[i].node.text  
                                    });
                                }


                                if (comments.length > 0) {
                                    var stringJSON = JSON.stringify(comments);

                                    InstaSaver.addZipItem({
                                        name: sideCarDate + '_' + sideCarItem.id + '.json', 
                                        data: stringJSON,     
                                    });  
                                }
                            }
                            // end saving comments


                            requestsCount++;      
                            if (requestsCount === media.length)
                                cb();

                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) {             
                            //debugger;
                        }

                    });                 
                }

            })(i);
        }    
    });
};

var getStories = function(userID, rhx_gis, cb) {
   
    var storiesObj = {
        "reel_ids": [userID],
        "tag_names":[],
        "location_ids":[],
        "highlight_reel_ids":[],
        "precomposed_overlay":false
    };
    
    var hashed = md5(rhx_gis + ":" + storiesObj);
    
    $.ajax({
        type: 'GET',
        beforeSend: function(xhr){xhr.setRequestHeader('x-instagram-gis', hashed);},
        url: 'https://www.instagram.com/graphql/query/?query_hash=45246d3fe16ccc6577e0bd297a5db1ab&variables=' + JSON.stringify(storiesObj),
        success: function(data){
            if (data.data.reels_media.length > 0) {
                data.data.reels_media[0].items.forEach(function(x) {
                    InstaSaver.addToStories(x);
                });
            }
            cb();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {          
           alert (XMLHttpRequest.responseJSON.message);
           stopSpin();           
        }
    }); 
};

var save = function(items, endCursor) {
    
    var userName = (items.instaUserName ? items.instaUserName : 'Instagram User');
    var mediaAmount = 50;                      
    var instaQueryHash = items.page_type === 0 ? '42323d64886122307be10013ad2dcc44': '8c86fed24fa03a8a2eea2a70a80c7b6b';

    var obj = {
        "id": items.instaUserID, 
        "first": mediaAmount
    };
    if (endCursor) {
        obj.after = endCursor;
    }

    var hashedHeader = md5(items.rhx_gis + ":" + obj);

    var variables = JSON.stringify(obj);
    var url = 'https://www.instagram.com/graphql/query/?';
    
    
    $.ajax({
        type: 'GET',
        beforeSend: function(xhr){xhr.setRequestHeader('x-instagram-gis', hashedHeader);},
        url: url,    
        data: 'query_hash=' + instaQueryHash + '&variables=' + variables,
        success: function(data){
            
            let media;
            if (items.page_type === 0) 
                media = data.data.user.edge_owner_to_timeline_media;
            else 
                media = data.data.user.edge_saved_media;

            InstaSaver.addToMedia(media.edges);
            var pageInfo = media.page_info;

            if (pageInfo.has_next_page) {                           
                save(items, pageInfo.end_cursor);
            }
            else {                    
                downloadMedia(function() {
                    InstaSaver.downloadAsZip(userName, function() {
                        stopSpin();
                    });
                });               
            }    
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {             
           if (XMLHttpRequest.status === 403) {
               alert ('Please log in to your Instagram account first.');
               stopSpin();
           }
        }
    });  
         
        
};


// download indicator
var spinner = initSpin();  
spinner.spin($("body")[0]); 
chrome.storage.local.get(null, function(items) {      
    if (items.saveStories == 'true') {   
        getStories(items.instaUserID, items.rhx_gis, function() { 
            save(items);
        });
    }
    else {
        save(items);
    }
});