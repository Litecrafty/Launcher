const electron = require('electron')
const {app, BrowserWindow} = electron

app.on('ready', () => {
  let win = new BrowserWindow({width:800, height: 600})
  win.loadURL(`https://google.com`)
  win.webContents.openDevTools()
})
