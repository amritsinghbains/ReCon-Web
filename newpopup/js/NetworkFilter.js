(function () {

  var harWithContent = [];

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

    var setMain = 'false';
  function getNetwork() {
    console.log('hanji')
    chrome.devtools.network.getHAR(getHarContent)

    

  }

  function listen() {

  
  }

  setInterval(function(){ 
    getNetwork(); 
  }, 1000);
  
  window.addEventListener('load', listen);

  function createRow(entry, index) {
    var li = document.createElement('li');


    var urlDiv = document.createElement('div');
    urlDiv.innerHTML = 'url: ' + entry.request.url;

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

    var urlDiv2 = document.createElement('div');
    urlDiv2.innerHTML = JSON.stringify(parseURL(entry.request.url));

    if(setMain == 'false'){
      setMain == 'true'
      var urlInfo = parseURL(entry.request.url);
      $('#host').text(urlInfo.host)
      $('#parent_domain').text(urlInfo.parent_domain)
      $('#protocol').text(urlInfo.protocol)
    }

    li.appendChild(urlDiv2);

    // li.appendChild(urlDiv);
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
      rowContainer.appendChild(createRow(entry, index));
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


