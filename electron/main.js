const { app, BrowserWindow } = require('electron')
const path = require('path')

// --- CORREÇÃO DE IMPORTAÇÃO ---
// Tenta pegar o .default (padrão novo) ou o próprio pacote (padrão antigo)
const electronServe = require('electron-serve')
const serve = electronServe.default || electronServe
// ------------------------------

// Configura para servir a pasta 'out'
const loadURL = serve({ directory: 'out' })

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Necessário para evitar bloqueios simples
      webSecurity: false
    },
    autoHideMenuBar: true,
  })

  // Carrega o app
  // Em produção (exe), usa o loadURL do electron-serve
  // Em dev, usa o localhost
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000')
  } else {
    loadURL(mainWindow)
  }

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})