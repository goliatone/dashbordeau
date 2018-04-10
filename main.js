'use strict';

const electron = require('electron');
const { Menu, app, shell, BrowserWindow } = require('electron');
const defaultMenu = require('electron-default-menu');
const path = require('path');
const url = require('url');

let main, webview, loaderData;

app.findDisplay = function(id) {
    if(typeof id === 'string') id = parseInt(id);
    let displays = electron.screen.getAllDisplays();
    return displays.find(display => {
        console.log('id', id, 'display id', display.id, display.id === id);
        return display.id === id;
    });
};

app.loaders = {};

function init() {
    let displays = electron.screen.getAllDisplays();
    app.displays = displays;

    createDefaultMenu();
    createWindow();
}

function centerToBounds(bounds, w, h) {
    let x = Math.ceil(bounds.x + ((bounds.width - w) / 2));
    let y = Math.ceil(bounds.y + ((bounds.height - h) / 2));
    return {x, y};
}

function createDefaultMenu() {
    const menu = defaultMenu(app, shell);
    menu.splice(4, 0, {
        label: 'Displays',
        submenu: [
            {
                label: 'New Dashboard',
                click: (item, focusedWindow) => {
                    main.reload();
                    main.show();
                }
            }
        ]
    });
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
}

function createWindow() {
    // Create the browser maindow.
    main = new BrowserWindow({
        width: 600,
        height: 720,
        titleBarStyle: 'hiddenInset',
        frame: false,
        show: false,
        icon: path.join(__dirname, 'assets/icons/png/64x64.png')
    });

    // and load the index.html of the app.
    main.loadURL(
        url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true
        })
    );

    // Open the DevTools.
    // main.webContents.openDevTools();

    main.on('ready-to-show', () => {
        main.show();
        main.focus();
    });
    // Emitted when the maindow is closed.
    main.on('closed', () => {
        // Dereference the maindow object, usually you would store maindows
        // in an array if your app supports multi maindows, this is the time
        // when you should delete the corresponding element.
        main = null;
    });
}

function createLoader(options = {}) {
    let display = app.findDisplay(options.display);
    
    const coordinates = centerToBounds(display.bounds, 1024, 800);

    // Create the loader webview, this will load our dashboard.
    webview = new BrowserWindow({
        x: coordinates.x,
        y: coordinates.y,
        width: 1024,
        height: 800,
        frame: false,
        // show: false
    });

    webview.setFullScreen(options.fullscreen);

    // and load the index.html of the app.
    webview.loadURL(
        url.format({
            pathname: path.join(__dirname, 'loader.html'),
            protocol: 'file:',
            slashes: true
        })
    );



    // Open the DevTools.
    // if (options.devTools) {
    webview.webContents.openDevTools();
    // }

    // Emitted when the maindow is closed.
    webview.on('closed', () => {
        // Dereference the maindow object, usually you would store maindows
        // in an array if your app supports multi maindows, this is the time
        // when you should delete the corresponding element.
        webview = null;
    });

    webview.uid = getUid();
    webview.display = display;
    webview.displayId = display.id;
    webview.reloading = false;
    webview.options = options;

    app.loaders[display.id] = webview;
    // webview.name = generateName();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser maindows.
// Some APIs can only be used after this event occurs.
app.on('ready', init);

// Quit when all maindows are closed.
app.on('maindow-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darmain') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a maindow in the app when the
    // dock icon is clicked and there are no other maindows open.
    if (main === null) {
        createWindow();
    }
});

const { ipcMain } = require('electron');

ipcMain.on('form.sumbit', (event, settings) => {
    console.log('form submit', settings);

    settings = formatSettings(settings);

    global.loaderData = loaderData = settings;

    createLoader(settings);
});

ipcMain.on('loader.ready', (event, msg) => {
    console.log('loader-ready', msg);

    event.sender.send('load.stuff', loaderData);
});

ipcMain.on('page.loaded', (event, url) => {
    console.log('page loaded...', url);

    if (webview.reloading) return;

    main.hide();
    webview.show();
    webview.reloading = true;

    console.log('setting reloader, interval %s', loaderData.interval);
    
    let id = webview.displayId;

    setInterval(function() {
        console.log('reload...');
        app.loaders[id].webContents.reload();
    }, loaderData.interval || 30000);
});

function formatSettings(settings) {
    let { interval = 5, units = 'minutes' } = settings;

    const conversion = {
        seconds: 1000,
        minutes: 60 * 1000,
        hours: 60 * 60 * 1000
    };

    settings.interval = parseInt(interval) * conversion[units];
    console.log('seetings', settings.interval);

    return settings;
}

/**
 * Generate an unique identifier in
 * the form or:
 * "jce1t9gu-sg69zzohk7"
 *
 * @param {Number} len Output length
 * @return {String}
 */
function getUid(len = 20) {
    const timestamp = new Date().getTime().toString(36);

    const randomString = len =>
        [...Array(len)].map(() => Math.random().toString(36)[3]).join('');

    len = len - (timestamp.length + 1);

    return `${timestamp}-${randomString(len)}`;
}
