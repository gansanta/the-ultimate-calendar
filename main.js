const { app, BrowserWindow, Menu } = require('electron')
const { dialog } = require('electron')

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            webviewTag: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        icon: __dirname + "/image/moon.ico"

    })

    win.loadFile('index.html')
    //win.webContents.openDevTools()
    createMainMenu()
}
function createMainMenu(){
    const menuTemplate = [
        
        {
            label: "Edit",
            submenu: [
                
                {
                    label: "Cut",
                    accelerator: 'CmdOrCtrl+X',
                    role: "cut"
                },
                {
                    label: "Copy",
                    accelerator: 'CmdOrCtrl+C',
                    role: "copy"
                },
                {
                    label: "Paste",
                    accelerator: 'CmdOrCtrl+V',
                    role: "paste"
                },
                {
                    label: "Select Everything!",
                    accelerator: 'CmdOrCtrl+A',
                    role: "selectAll"
                }
            ]
        },
        {
            label: "Tools",
            submenu: [
                {
                    label: "Reload",
                    role: "reload"
                },
                {
                    label: "Developer tools",
                    click(item, focusedWindow){
                        if(focusedWindow) focusedWindow.webContents.openDevTools()
                    }
                },
                
            ]
        },
        {
            label: "About",
            click(item, focusedWindow){
                if(focusedWindow) {
                    dialog.showMessageBox(focusedWindow, { 
                        message: "A program developed by Gansanta Bhikkhu, 2022 in ITBMU, Myanmar",
                        type:"info",
                        title:"Buddhist Lunar Calendar",
                        detail:"The program displays easy-to-look-up dates of BC or AD, ranging from 700BC up to 2100 AD. Adhimāsa is also visible. \nLunar phase data is by courtesy of Fred Espenak, www.Astropixels.com",
                     })
                }
                
            }
        },
        
    ]

    const mainmenu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(mainmenu)
}


app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})