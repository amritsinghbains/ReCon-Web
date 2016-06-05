(function () {
  var superData = [];
  var superDataAnalysis = [];
  var harWithContent = [];
  var subDomainCount = 0;
  var externalDomainCount = 0;

  var usernameCount = 0;
  var nameCount = 0;
  var idCount = 0;
  var locationCount = 0;
  var genderCount = 0;
  var contactCount = 0;
  var passwordCount = 0;
  var superLeakiness = 0; 

  var type2max_points = {
      'username': 100,
      'name': 200,
      'id': 100,
      'coarse_location': 50,
      'location': 100,
      'gender': 50,
      'contact': 200,
      'password': 500,
  }

  var type2points_per_leak = {
    'username': 20,
    'name': 50,
    'id': 1,
    'coarse_location': 2,
    'location': 10,
    'gender': 2,
    'contact': 20,
    'password': 500,
  }

  function smallerBetweenTwo(var1, var2){
    if(var1 < var2){
      return var1;
    }else{
      return var2;
    }
  }

  function calculateLeakiness(){
    var leakiness = 20;
    leakiness += smallerBetweenTwo(usernameCount*type2points_per_leak.username, type2max_points.username);
    leakiness += smallerBetweenTwo(nameCount*type2points_per_leak.name, type2max_points.name);
    leakiness += smallerBetweenTwo(idCount*type2points_per_leak.id, type2max_points.id);
    leakiness += smallerBetweenTwo(locationCount*type2points_per_leak.location, type2max_points.location);
    leakiness += smallerBetweenTwo(genderCount*type2points_per_leak.gender, type2max_points.gender);
    leakiness += smallerBetweenTwo(contactCount*type2points_per_leak.contact, type2max_points.contact);
    leakiness += smallerBetweenTwo(passwordCount*type2points_per_leak.password, type2max_points.password);

    $('#leakinessCount').text(leakiness);
    superLeakiness = leakiness;

  }

  function filterHar() {
    var contentFiltered = filterByContent(harWithContent);
    contentFiltered = filterByOther(contentFiltered);
    contentFiltered = filterByMinMax(contentFiltered);
    updateUI(contentFiltered);
  }

  function filterByContent(harWithContent) {

    var filterText = document.getElementById('filterByContent').value.toLowerCase();

    if (filterText.length < 3) {
      return harWithContent;
    }

    return harWithContent.filter(function (entry) {
      return entry.responseBody && entry.responseBody.toLowerCase().indexOf(filterText) !== -1;
    })
  }

  function filterByOther(contentFiltered) {

    var filterText = document.getElementById('filterByOtherInfo').value.toLowerCase();

    if (filterText.length < 3) {
      return contentFiltered;
    }


    return contentFiltered.filter(function (entry) {

      return entry.response.status.toString().indexOf(filterText) !== -1 ||
        entry.request.url.toLowerCase().indexOf(filterText) !== -1 ||
        entry.response.content.mimeType.toLowerCase().indexOf(filterText) !== -1 ||
        entry.startedDateTime.toString().toLowerCase().indexOf(filterText) !== -1 ||
        (entry.request.postData && entry.request.postData.text && entry.request.postData.text.toLowerCase().indexOf(filterText) !== -1);
    })
  }

  function filterByMinMax(contentFiltered) {
    var min = document.getElementById('min').value;
    var max = document.getElementById('max').value;

    return contentFiltered.filter(function (entry) {

      if (min && min > entry.responseBody.length) {
        return false
      }
      else if (max && max < entry.responseBody.length) {
        return false;
      }
      else {
        return true;
      }

    })
  }

  function getHarContent(HarLog) {

    HarLog.entries.forEach(function (entry, index) {

      if (!harWithContent[index]) {

        entry.getContent(function (content, encoding) {


          entry.responseBody = content;

          harWithContent.push(entry);

          if (HarLog.entries.length >= harWithContent.length) {

            filterHar(harWithContent);
          }
        });
      }
    });
  }

  function parseURL(url){
      parsed_url = {}

      if ( url == null || url.length == 0 )
          return parsed_url;

      protocol_i = url.indexOf('://');
      parsed_url.protocol = url.substr(0,protocol_i);

      remaining_url = url.substr(protocol_i + 3, url.length);
      domain_i = remaining_url.indexOf('/');
      domain_i = domain_i == -1 ? remaining_url.length - 1 : domain_i;
      parsed_url.domain = remaining_url.substr(0, domain_i);
      parsed_url.path = domain_i == -1 || domain_i + 1 == remaining_url.length ? null : remaining_url.substr(domain_i + 1, remaining_url.length);

      domain_parts = parsed_url.domain.split('.');
      switch ( domain_parts.length ){
          case 2:
            parsed_url.subdomain = null;
            parsed_url.host = domain_parts[0];
            parsed_url.tld = domain_parts[1];
            break;
          case 3:
            parsed_url.subdomain = domain_parts[0];
            parsed_url.host = domain_parts[1];
            parsed_url.tld = domain_parts[2];
            break;
          case 4:
            parsed_url.subdomain = domain_parts[0];
            parsed_url.host = domain_parts[1];
            parsed_url.tld = domain_parts[2] + '.' + domain_parts[3];
            break;
      }

      parsed_url.parent_domain = parsed_url.host + '.' + parsed_url.tld;

      return parsed_url;
  }

  function getNetwork() {
    chrome.devtools.network.getHAR(getHarContent)

    $.ajax({
    type: "GET", //or GET
    url: 'http://api.ipify.org?format=jsonp&callback=?',
    
    crossDomain:true,
    cache:false,
    async:false,
    error: function(data){
        // alert('11111')
        data = data.responseText
        // data = JSON.stringify(data.responseText, null, 2);
        data = data.substring(9, data.length-4)
        // console.log(data)
        $.ajax({
          type: "GET", //or GET
          url: 'https://recon-node.herokuapp.com/getwebsitefromip?ip=' + data ,
          
          crossDomain:true,
          cache:false,
          async:false,
          success: function(data){
              // alert('Saved on server')
              // data = data.replace(/%22/g, " ");
              data = JSON.parse(data)
              // console.log(data) 
              superData[0] = data[0];
              superData[1] = data[1];
              superData[2] = data[2];
              $('#favicon').attr('src', superData[0])
              $('#host').text(superData[1])
              $('#parent_domain').text(superData[2])

              superDataAnalysis = parseURL(superData[2]);
              
         }
        });


   }
  });
    

  }

  function listen() {
  }

  function analyseUrl(url) {
    // console.log('boom')
    // console.log(parseURL(url))
    if(superDataAnalysis.domain == parseURL(url).domain){
      $('#subDomainCount').text(++subDomainCount);
    }else{
      $('#externalDomainCount').text(++externalDomainCount);
      // alert(parseURL(url).path)

      if(parseURL(url).path.indexOf('username') > -1){
        usernameCount++;
        $('#usernameIcon').attr('src', 'images/checked.png')
      }

      if(parseURL(url).path.indexOf('name') > -1){
        nameCount++;
        $('#nameIcon').attr('src', 'images/checked.png')
      }

      if(parseURL(url).path.indexOf('id') > -1){
        idCount++;
        $('#idIcon').attr('src', 'images/checked.png')
      }

      if(parseURL(url).path.indexOf('location') > -1 || parseURL(url).path.indexOf('geo') > -1 || parseURL(url).path.indexOf('latitude') > -1 || parseURL(url).path.indexOf('lat') > -1){
        locationCount++;
        $('#locationIcon').attr('src', 'images/checked.png')
      }

      if(parseURL(url).path.indexOf('gender') > -1 || parseURL(url).path.indexOf('male') > -1){
        genderCount++;
        $('#genderIcon').attr('src', 'images/checked.png')
      }

      if(parseURL(url).path.indexOf('contact') > -1 || parseURL(url).path.indexOf('phone') > -1 || parseURL(url).path.indexOf('number') > -1){
        contactCount++;
        $('#contactIcon').attr('src', 'images/checked.png')
      }

      if(parseURL(url).path.indexOf('password') > -1 || parseURL(url).path.indexOf('pass') > -1){
        passwordCount++;
        $('#passwordIcon').attr('src', 'images/checked.png')
      }

      calculateLeakiness();

    }

    
  }

  setInterval(function(){ 
    getNetwork(); 
  }, 2000);
  
  window.addEventListener('load', listen);
    console.log('sdsdf22')

  document.getElementById('submitLeakiness').onclick = function () {
    console.log('sdsdf')
    // if(superLeakiness == 0){
    //   return 1;
    // }
    $.ajax({
      type: "POST", //or GET
      url: 'https://recon-node.herokuapp.com/websiteandleakiness',
      data: {
        website: superData[2],
        leakiness: superLeakiness
      },
      crossDomain:true,
      cache:false,
      async:false,
      success: function(data){
                        
     }
    });

  }

  function createRow(entry, index) {
    var li = document.createElement('li');


    var urlDiv = document.createElement('div');
    urlDiv.innerHTML = 'url: ' + entry.request.url;

    analyseUrl(entry.request.url);

    var mimeTypeDiv = document.createElement('div');
    mimeTypeDiv.innerHTML = 'mimeType: ' + entry.response.content.mimeType;

    var dateTimeDiv = document.createElement('div');
    dateTimeDiv.innerHTML = 'dateTime: ' + entry.startedDateTime;

    var statusDiv = document.createElement('div');
    statusDiv.innerHTML = 'status: ' + entry.response.status;

    var postDataDiv = document.createElement('div');

    if(entry.request.postData && entry.request.postData.text)
    {
      postDataDiv.innerHTML = 'postData: ' + entry.request.postData.text;
    }

    var responseBodyDiv = document.createElement('div');
    var responseBody;
    if (document.getElementById('pretty').checked) {
      responseBody = '<pre><code>' + syntaxHighlight(entry.responseBody) + '</pre></code>';
    }
    else {
      responseBody = '<code>'  + entry.responseBody+ '</code>';
    }

    responseBodyDiv.innerHTML = 'Response Body: ';
    var responseBodyValueSpan = document.createElement('span');
    var bodyId = 'resBodyRow' + index;
    responseBodyValueSpan.setAttribute('id', bodyId);

    var highlightTarget = document.getElementById('filterByContent').value;
    var otherHighlightTarget = document.getElementById('filterByOtherInfo').value;

    if (highlightTarget && highlightTarget.length > 2 && document.getElementById('highlight').checked) {
      responseBody = highlight(responseBody, highlightTarget);
    }

    if (otherHighlightTarget && otherHighlightTarget.length > 2 && document.getElementById('highlight').checked) {
      if(entry.request.postData && entry.request.postData.text)
      {
        postDataHighlight = highlight(entry.request.postData.text, otherHighlightTarget)
        postDataDiv.innerHTML = 'postData high: ' + postDataHighlight;
      }
    }


    responseBodyValueSpan.innerHTML = responseBody;
    responseBodyDiv.appendChild(responseBodyValueSpan);

    responseBodyValueSpan.onclick = function () {
      if (document.getElementById('selectAll').checked) {
        selectText(bodyId);
      }
    };

    

    li.appendChild(urlDiv);
    // li.appendChild(mimeTypeDiv);
    // li.appendChild(dateTimeDiv);
    // li.appendChild(statusDiv);
    // li.appendChild(postDataDiv);
    // li.appendChild(responseBodyDiv);

    return li;
  }

  function updateUI(entries) {
    var rowContainer = document.querySelector('.network-entries');
    rowContainer.innerHTML = '';
    entries.forEach(function (entry, index) {
      createRow(entry, index);
      // rowContainer.appendChild(createRow(entry, index));
    });
  }

  function syntaxHighlight(json) {
    var indents = 0;
    if (typeof json != 'string') {
      json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|\{|\[|]|}|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      var cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
          for (var i = 0; i < indents; i++) {
            match = '  ' + match;
          }
          match = '\n' + match;

        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }

      if (match.match(/\{/g))
      {
        indents += match.match(/\{/g).length;
        cls = 'bracket';
      }
      if (match.match(/\[/g))
      {
        indents += match.match(/\[/g).length;
        cls = 'bracket';
      }
      if (match.match(/}/g))
      {
        indents -= match.match(/}/g).length;
        cls = 'bracket';
      }
      if (match.match(/]/g))
      {
        indents -= match.match(/]/g).length;
        cls = 'bracket';
      }

      return '<span class="' + cls + '">' + match + '</span>';
    });
  }

  function highlight(string, target) {
    target = "(" +
      target.replace(/([{}()[\]\\.?*+^$|=!:~-])/g, "\\$1")
      + ")";

    var r = new RegExp(target, "igm");
    return string.replace(/(>[^<]+<)/igm, function (a) {
      return a.replace(r, "<span class='hl'>$1</span>");
    });
  }

  function selectText(containerId) {
    var range;
    if (document.selection) {
      range = document.body.createTextRange();
      range.moveToElementText(document.getElementById(containerId));
      range.select();
    } else if (window.getSelection) {
      range = document.createRange();
      range.selectNode(document.getElementById(containerId));
      window.getSelection().addRange(range);
    }
  }

})();


