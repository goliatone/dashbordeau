'use strict';

console.log('loader...');
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;

document.addEventListener('DOMContentLoaded', function(event) {
    let data = remote.getGlobal('loaderData');

    var script = document.createElement('script');
    script.src = 'https://code.jquery.com/jquery-3.2.1.min.js';

    script.onload = script.onreadystatechange = function() {
        console.log('on load!!!');
        // https://sso.online.tableau.com/public/idp/SSO
        $(function() {
            $('#email').val(data.email);
            $('#password').val(data.password);
            $('#login-submit').click();

            if(document.location.href.indexOf(data.endpoint) === 0) {
                ipc.send('page.loaded', document.location.href);
            }
        });
    };
    document.body.appendChild(script);
});