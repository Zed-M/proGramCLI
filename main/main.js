const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');
const meow = require('meow');

const main = path.join(__dirname, '..', 'main', 'app/index.html');
let win;

const cli = meow(
	`
    Usage
      $ program

    Options
      --settings, -s  Open settings page to edit profile

    Examples
      $ program

      $ program --settings
`,
	{
		flags: {
			settings: {
				type: 'boolean',
				alias: 's'
			},
			version: {
				alias: 'v'
			},
			help: {
				alias: 'h'
			}
		}
	}
);

const {
	flags: { settings }
} = cli;

function createWindow() {
	win = new BrowserWindow({
		title: 'Program',
		width: 400,
		height: 700,
		resizable: false,
		frame: false,
		titleBarStyle: 'hidden',
		webPreferences: {
			nodeIntegration: true
		}
	});

	win.loadFile(main);
}

ipcMain.on('requestedSettings', () => {
	win.webContents.send('settings', settings);
});

ipcMain.on('getDirectory', (event, arg) => {
	dialog.showOpenDialog({ properties: ['openDirectory'] }, dir => {
		if (dir) {
			win.webContents.send('directoryAdded', dir[0]);
		} else {
			win.webContents.send('directoryNotAdded');
		}
	});
});

ipcMain.on('getImage', (event, arg) => {
	dialog.showOpenDialog({ properties: ['openFile'] }, filePaths => {
		if (filePaths) win.webContents.send('imgAdded', filePaths[0]);
	});
});

ipcMain.on('uploadProfile', (event, arg) => {
	dialog.showOpenDialog({ properties: ['openFile'] }, filePaths => {
		if (filePaths) win.webContents.send('profileAdded', filePaths[0]);
	});
});

app.on('ready', createWindow);

// Checks for available update and returns an instance
const notifier = updateNotifier({
	pkg,
	updateCheckInterval: 1000 * 60 * 60 * 1
});

// Notify using the built-in convenience method
notifier.notify();
