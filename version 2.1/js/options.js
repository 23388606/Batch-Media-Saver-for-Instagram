var saveDates = function() {
    
    var firstTS, lastTS;
    
    if (document.getElementById('firstDate').value != "" && document.getElementById('lastDate').value != "") {
        firstTS = moment(document.getElementById('firstDate').value, "YYYY-MM-DD").unix();
        //add one day to last date so that to get the correct range while saving media for one day
        lastTS = moment(document.getElementById('lastDate').value, "YYYY-MM-DD").add(1, 'days').unix();

    }    
    
    chrome.storage.local.set({
        'firstTS': firstTS,
        'lastTS': lastTS,
        'saveComments': (document.getElementById('saveComments').checked ? 'true': 'false')
    });
};

var resetDates = function() {
    
    document.getElementById('firstDate').value = "";
    document.getElementById('lastDate').value = "";
    
    chrome.storage.local.set({
        'firstTS': null,
        'lastTS': null
    });
        
};


var restoreDates = function() {
    
   
    if (document.getElementById('save') != null) { 
        document.getElementById('save').addEventListener('click', saveDates);
    } 
    
    if (document.getElementById('resetDate') != null) { 
        document.getElementById('resetDate').addEventListener('click', resetDates);
    } 
    
    var firstDateField = document.getElementById('firstDate');
    var lastDateField = document.getElementById('lastDate');
    
    if (firstDateField !== null) {
        firstDateField.addEventListener('blur', function(field) {                
            if (moment(lastDateField.value).isBefore(firstDateField.value)) {
                firstDateField.value = lastDateField.value;
            }
        });  
        firstDateField.setAttribute("max", moment().format("YYYY-MM-DD"));
    }

    if (lastDateField !== null) {
        lastDateField.addEventListener('blur', function(field) {                
            if (moment(lastDateField.value).isBefore(firstDateField.value)) {
                firstDateField.value = lastDateField.value;
            }
        });  
        lastDateField.setAttribute("max", moment().format("YYYY-MM-DD"));
    }
    
    chrome.storage.local.get(null, function (items) {  
        if (items.lastTS) {
            if (lastDateField != null) { 
                lastDateField.value = moment.unix(items.lastTS).subtract(1, 'days').format("YYYY-MM-DD");                   
            }
        }
        if (items.firstTS) {
            if (firstDateField != null) { 
                firstDateField.value = moment.unix(items.firstTS).format("YYYY-MM-DD"); 
            }
        }
        if (items.saveComments) {
            document.getElementById('saveComments').checked = (items.saveComments == 'true' ? true: false);
        }
    });
};
                            
document.addEventListener('DOMContentLoaded', restoreDates);