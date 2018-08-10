var getRHX_GIS = function() {
    
    var scr = document.querySelectorAll("script");
    
    for (var i = 0; i < scr.length; i++) {    

        var rhx_gis = scr[i].textContent.match(/\"rhx_gis\"\:\"(.*?)\"/);
        if (rhx_gis) {  
           
            InstaSaver.setRhxGis(rhx_gis[1]);
            chrome.storage.local.set({
                'rhx_gis': rhx_gis[1]
            });
            break;
        }
    }
};

getRHX_GIS();