'use strict'

const electron = require('electron')
const $ = require('jquery')

require('electron-pug')({
    pretty: true
}, {
    config: require('./config')
})

const {
    app,
    BrowserWindow
} = electron

let mainWindow

const isAlreadyRunning = app.makeSingleInstance(() => {
    if (mainWindow) {
        if (mainWindow.isMinimized()) {
            mainWindow.restore()
        }

        mainWindow.show()
    }
})

if (isAlreadyRunning) {
    app.quit()
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        show: false,
        title: app.getName(),
        width: 500,
        height: 600,
        minWidth: 500,
        minHeight: 600,
        maxWidth: 500,
        maxHeight: 600,
        fullscreen: false,
        resizable: false,
        backgroundColor: '#2196F3',
        frame: false
    })

    mainWindow.$ = $

    mainWindow.loadURL('file://' + __dirname + '/views/index.pug')

    if (process.platform === 'darwin') {
        mainWindow.setSheetOffset(30)
    }

    mainWindow.on('enter-full-screen', e => {
        e.preventDefault()
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
        mainWindow.focus()
    })

    mainWindow.on('closed', () => {
        mainWindow = null
    })

    mainWindow.on('close', () => {
        app.exit(0)
    })

    mainWindow.webContents.on('new-window', (e, url) => {
        e.preventDefault()
        electron.shell.openExternal(url)
    })

    mainWindow.webContents.on('will-navigate', (e, url) => {
        e.preventDefault()
        electron.shell.openExternal(url)
    })
})
