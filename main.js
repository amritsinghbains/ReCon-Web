var superStorage = '';
chrome.devtools.panels.create(
    'ReCon Web',
    null, // No icon path
    'Panel/NetworkFilterPanel.html',
    null // no callback needed
);
