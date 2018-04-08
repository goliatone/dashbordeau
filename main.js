'use strict';

const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

// Keep a global reference of the maindow object, if you don't, the maindow will
// be closed automatically when the JavaScript object is garbage collected.
let main, webview, loaderData;

function createWindow() {
    // Create the browser maindow.
    main = new BrowserWindow({
        width: 600,
        height: 590,
        titleBarStyle: 'hiddenInset',
        frame: false,
        show: false
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

    main.on('ready-to-show', () =>{
        main.show();
    });
    // Emitted when the maindow is closed.
    main.on('closed', () => {
        // Dereference the maindow object, usually you would store maindows
        // in an array if your app supports multi maindows, this is the time
        // when you should delete the corresponding element.
        main = null;
    });
}

function createLoader() {
    // Create the browser maindow.
    webview = new BrowserWindow({
        width: 1024,
        height: 800,
        frame: false,
        show: false
    });

    // webview.setFullScreen(true);

    // and load the index.html of the app.
    webview.loadURL(
        url.format({
            pathname: path.join(__dirname, 'loader.html'),
            protocol: 'file:',
            slashes: true
        })
    );

    // Open the DevTools.
    // webview.webContents.openDevTools();

    // Emitted when the maindow is closed.
    webview.on('closed', () => {
        // Dereference the maindow object, usually you would store maindows
        // in an array if your app supports multi maindows, this is the time
        // when you should delete the corresponding element.
        webview = null;
    });

    webview.reloading = false;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser maindows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

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

    createLoader();
});

ipcMain.on('loader.ready', (event, msg) => {
    console.log('loader-ready', msg);

    event.sender.send('load.stuff', loaderData);
});

let active = false;

ipcMain.on('page.loaded', (event, url) => {
    console.log('page loaded...', url);
    
    if (webview.reloading) return;
    
    main.hide();
    webview.show();
    webview.reloading = true;

    console.log('setting reloader, interval %s', loaderData.interval);

    setInterval(function() {
        console.log('reload...');
        webview.webContents.reload();
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
