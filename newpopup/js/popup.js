/**
 * popup.js
 *
 */

var TITLE_LENGTH_LIMIT = 50;
var favicon_url_regex = /localhost/i;
var tab_list = [];
var current_tab = [];

// labels
var $pinned_label = $('<span class="label label-default">pinned</span>');
var $active_label = $('<span class="label label-success">active</span>');
var $audible_label = $('<span class="label label-primary">audible</span>');

// tab functions

function close_all_tabs(){
  // chrome.tabs.query({
  //   currentWindow: true
  // }, function(tabs){
  //     var i;
  //     var tabs_ids = [];

  //     for(i = 0; i < tabs.length; i++){
  //       tabs_ids.push(tabs[i].id);
  //     }
  //     chrome.tabs.remove(tabs_ids);
  // });
}

function update_total_tabs_count(){
  // $('#tabs_count').text($('ul#tabs li').length);
}

function go_to_tab(tab_id){
  // chrome.tabs.update(tab_id, {
  //   active: true
  // }, function(tab_updated){
  //   console.log('tab updated: ' + tab_id);
  // });
}

function close_tab(tab_id){
  // chrome.tabs.get(tab_id, function(tab){
  //   // save the tab's title to use it later
  //   tab_title = tab.title;
  //   chrome.tabs.remove(tab.id);
  //   $('#alert_success').html('Tab <strong>' + get_tab_title(tab_title) + '</strong> was successfully closed.').show();
  // });

  // // fade out the message after 5 seconds
  // setTimeout(function(){
  //   $('#alert_success').fadeOut();
  // }, 5000);
}

// list creation functions

function add_favicon(li, favicon_url){
  favicon = $('<img />');

  if(favicon_url === undefined || favicon_url_regex.exec(favicon_url))
    favicon_url = "page.png";

  favicon.attr({src: favicon_url, id: 'favicon'});

  li.append(favicon);
}

function get_tab_title(tab_title){
  title = tab_title;
  if(tab_title.length > TITLE_LENGTH_LIMIT)
    title = tab_title.substring(0, TITLE_LENGTH_LIMIT) + '...';
  return title;
}

function add_title(link, tab_title){
  title = get_tab_title(tab_title);
  link.append(title);
}

function add_link(li, tab_id, tab_title){
  link = $('<span></span>');
  // link.attr({href: '#', id: tab_id});
  link.attr({class: 'title'});
  add_title(link, tab_title);
  li.append(link);
}

function add_label(li, tab){
  if(tab.pinned === true)
    li.append($pinned_label);

  if(tab.active === true)
    li.append($active_label);

  if(tab.audible === true)
    li.append($audible_label);
}

function add_close_button(li, tab_id){
  // var button = $('<button></button>');
  // button.attr({class: 'btn btn-danger btn-xs', id: tab_id, style: 'float: right', title: 'Close tab'});
  // var span = $('<span></span>');
  // span.attr({class: 'glyphicon glyphicon-remove'});
  // button.append(span);

  // button.click(function(){
  //   close_tab(tab_id);
  //   li.remove();
  //   update_total_tabs_count();
  // });

  // li.append(button);
}

function create_tab_link(tab){
  if(tab.active === true){
    current_tab.push(tab);
    ul = $('ul#tabs');

    li = $('<li></li>');
    li.attr({class: 'collection-item avatar', style: 'min-height: 40px;'});

    add_favicon(li, tab.favIconUrl);
    add_link(li, tab.id, tab.title);
    // add_title(li, tab.title)
    // add_label(li, tab);
    // li.append($active_label);

    add_close_button(li, tab.id);

    ul.append(li);
    fetchNumberForCurrentTab();
  }
}

// Search functions
function filter_list(condition) {
  // $('#alert_error').html('<strong>OPS!</strong> nothing find here :/.').hide();
  // $("#tabs li").remove();

  // tab_list.filter(function (t) {
  //   return condition(t);
  // }).forEach(function (t) {
  //   create_tab_link(t);
  // });

  // if ($("#tabs li").length === 0) {
  //   $('#alert_error').html('<strong>OPS!</strong> nothing find here :/.').show();
  // }
}
function search_in_tabs(argument) {
  // var reg = new RegExp(argument, "gi");
  // filter_list(function (t) {
  //   return t.url.match(reg) || t.title.match(reg);
  // });
}

function filter_tab_by(type) {
  // filter_list(function (t) {
  //   return t[type];
  // });
}

function getCurrentTab(){
  if(localStorage.currentTab == undefined){
    // alert('nothing')
  }else{
    setValueTabInUl();
  }
}

function setValueTabInUl(){
  $('#currenttab').empty();
  currentTab = JSON.parse(localStorage.currentTab)
  ul = $('ul#currenttab');

  li = $('<li></li>');
  li.attr({class: 'collection-item avatar', style: 'min-height: 40px;'});

  add_favicon(li, currentTab[0].favIconUrl);
  add_link(li, currentTab[0].id, currentTab[0].title);
  ul.append(li);
}

function setCurrentTab(){
  $('#loaderButton').show();
  $('#tickButton').hide();

  localStorage.currentTab = JSON.stringify(current_tab)
  // alert(JSON.stringify(current_tab))
  var value = [];
  value[0] = current_tab[0].favIconUrl;
  value[1] = current_tab[0].title;
  value[2] = current_tab[0].url;
  
  setValueTabInUl();
  
  return true && registerCallOnServer(value, current_tab[0].url);

}

function registerCallOnServer(value, website){

  $.ajax({
    type: "GET", //or GET
    url: 'http://api.ipify.org?format=jsonp&callback=?',
    crossDomain:true,
    cache:false,
    async:false,
    error: function(data){
        
        data = data.responseText
        // data = JSON.stringify(data.responseText, null, 2);
        data = data.substring(9, data.length-4)
        console.log(data)
        $.ajax({
          type: "POST", //or GET
          url: 'https://recon-node.herokuapp.com/ipandwebsite',
          data: {
            ip: data,
            website: website,
            value: JSON.stringify(value)
          },
          crossDomain:true,
          cache:false,
          async:false,
          success: function(data){
              $('#loaderButton').hide();
              $('#tickButton').show();              
         }
        });


   }
  });
}

function fetchNumberForCurrentTab() {
  // chrome.browserAction.setBadgeText({text: ""});  
  $.ajax({
          type: "GET", //or GET
          url: 'https://recon-node.herokuapp.com/getleakinessfromwebsite?website=' + current_tab[0].url,
          crossDomain:true,
          cache:false,
          async:false,
          success: function(data){
            // alert(current_tab[0].url)
            // alert(data == null)
            if(data == null){
              chrome.browserAction.setBadgeText({text: ""});
            }else{
              chrome.browserAction.setBadgeText({text: parseInt(data) + ""});            
            }
         }
        });
}

$(document).ready(function(){
  chrome.tabs.query({
    currentWindow: true
  }, function(tabs) {
    tab_list = tabs;
    getCurrentTab();
    document.getElementById("reglink").addEventListener("click",setCurrentTab);
    for(var i = 0; i < tabs.length; i++){
      tab = tabs[i];
      create_tab_link(tab);
    }

    $("#form-container").on("keyup", "input", function () {
      search_in_tabs($(this).val());
    });

    $("#filter-list").on("click", "span", function (){
      filter_tab_by($(this).data("type"));
    });

    $("ul#tabs li a").on("click", function(){
      tab_id = parseInt($(this).attr('id'));
      go_to_tab(tab_id);
    });

    $('#btn-close-all-tabs').on("click", function(){
      close_all_tabs();
    });

    update_total_tabs_count();

    // fetchNumberForCurrentTab();
  });
});
