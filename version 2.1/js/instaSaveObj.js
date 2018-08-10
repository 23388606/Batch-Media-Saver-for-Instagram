(function(exports) {
    
    // ---------- RHX_GIS ----------
    var rhx_gis;
    
    exports.setRhxGis = function(r) {
        rhx_gis = r;
    };
    
    exports.getRhxGis = function() {
        return rhx_gis;
    };
    
    
    // ---------- ARRAY OF ITEMS TO BE SAVED ----------
    var zipContentItems = [];     
      
    exports.itemPresentInArray = function (i) {
        return zipContentItems.indexOf(i) > -1;
    };
    
    exports.addZipItem = function (i) {            
        zipContentItems.push(i);
    };
    
    exports.clearZipContentItems = function() {
        zipContentItems = [];
    };
    
    exports.getZipContents = function() {
        return zipContentItems;
    };
    
    
    //------ ARRAY OF ALL MEDIA DOWNLOADED --------
    var allMedia = [];
    
    exports.addToMedia = function (arr) { 
        allMedia.push(...arr);
    };
    
     exports.getAllMedia = function() {
        return allMedia;
    };
    
    // ---------- ZIP DOWNLOAD ------------------
    exports.downloadAsZip = function(title, cb) {
    
        var count = 0;
        var files = [];
        var info = document.getElementById('__infoText');
        
        if (zipContentItems.length > 0) {
            downloadFile(zipContentItems[count], onDownloadComplete);
        }
        else {
            zipBlob(files, title);
        }



        function downloadFile(file, success) {

            if (file.url) {
                var xhr = new XMLHttpRequest(); 
                xhr.open('GET', file.url, true); 
                xhr.responseType = "blob";
                xhr.onreadystatechange = function () { 
                    if (xhr.readyState == 4) {                    
                        if (success) onDownloadComplete(xhr.response);
                    }
                };
                xhr.send(null);
            }
            else {
                onDownloadComplete(file.data);
            }
        }


        function onDownloadComplete(blobData){

            if (count < zipContentItems.length) {

                // add downloaded file to array                        
                files.push({name: zipContentItems[count].name, file: blobData});                 
                if (count < zipContentItems.length -1){
                    count++;                    
                    
                    if (info) {
                        info.textContent = 'Downloading... ' + count + ' out of ' + zipContentItems.length;
                    }
                    downloadFile(zipContentItems[count], onDownloadComplete);
                }
                else {        
                    zipBlob(files, title);
                }
            }
        }

        function zipBlob(files, title) {
            zip.createWriter(new zip.BlobWriter("application/zip"), function(writer) {
                var start = new Date().getTime();

                var f = 0;

                function nextFile(f) {
                    
                    fblob = new Blob([files[f].file], { type: "text/plain" });
                    writer.add(files[f].name, new zip.BlobReader(fblob), function() {
                        // callback
                        f++;                         
                        if (info) {
                            info.textContent = 'Creating a zip archive...';
                            info.textContent += f + ' out of ' + zipContentItems.length;
                        }
                        if (f < files.length) {
                            nextFile(f);
                        } else close();
                    });
                }

                function close() {
                    // close the writer
                    writer.close(function(blob) {
                        // save with FileSaver.js
                        saveAs(blob, title + '.zip');                                     
                        cb();
                    });
                }

                nextFile(f);

            }, onerror);
        }
    }
    
})(this.InstaSaver = {});