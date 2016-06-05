chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.query({'active': true, currentWindow: true},
       function(tabs){
          console.log(tabs[0].url);
          // alert(tabs[0].url);
          $('#logo-container').text('sfdgs')
       }
    );
});