// Modules to control application life and create native browser window
const {
    app,
    BrowserWindow,
    ipcMain,Menu
} = require('electron')
const path = require('path')
let mainWindow;
const {Client,Authenticator} = require('minecraft-launcher-core')
const launcher = new Client()
let auth;
let auto_connect;
let minO;
let maxO;
let javaVersion;
<<<<<<< Updated upstream
let logs = ['Настраиваем окружение...', 'Печатаем бланки ПСЖ...', 'Раздаём стипендию на сервере...', 'Проблемы с подключением? Этот вопрос можно уточнить у студенческого офиса! Они работают с 9 до 18 часов каждый день по адресу ул.Ломоносова 9 ауд 1400', 'Освобождаем бюджетные места на сервере', 'Ждём ответа от ИСУ...', 'Осуществляем дистанционное подключение...', 'Отчисляем админа...', 'Переводим контрактников', 'Подписываем приказ об отчислении', 'Открываем ЦДО', 'Чиним крышу спавна'];

=======
let version = '2.0';


let logs = ['Настраиваем окружение...', 'Печатаем бланки ПСЖ...', 'Раздаём стипендию на сервере...', 'Проблемы с подключением? Этот вопрос можно уточнить у студенческого офиса! Они работают с 9 до 18 часов каждый день по адресу ул.Ломоносова 9 ауд 1400', 'Освобождаем бюджетные места на сервере', 'Ждём ответа от ИСУ...', 'Осуществляем дистанционное подключение...', 'Отчисляем админа...', 'Переводим контрактников', 'Подписываем приказ об отчислении', 'Открываем ЦДО', 'Чиним крышу спавна', 'Садим морковь'];
const electronInstaller = require('electron-winstaller');
>>>>>>> Stashed changes
//JAVA VERSION CHECK
function javaversion(callback) {
    var spawn = require('child_process').spawn('java', ['-version']);
    spawn.on('error', function(err){
        return callback(err, null);
    })
    spawn.stderr.on('data', function(data) {
        data = data.toString().split('\n')[0];
        var javaVersion = new RegExp('java version').test(data) ? data.split(' ')[2].replace(/"/g, '') : false;
        if (javaVersion != false) {
            // TODO: We have Java installed
            return callback(null, javaVersion);
        } else {         
            // TODO: No Java installed
        }
    });
}
javaversion(function(err,version){
        javaVersion = version;
})


//Menu.setApplicationMenu(false)
function createWindow() {
    // Create the browser window.
     mainWindow = new BrowserWindow({
        width: 850,
        height: 650,
        resizable: false,

        webPreferences: {
            nodeIntegration: true
        }
    })
    // and load the index.html of the app.
    mainWindow.loadFile('public/index.html')
    mainWindow.setMenuBarVisibility(false)
    mainWindow.webContents.session.clearStorageData();
//  storeWindow.loadURL('public/index.html');
//  storeWindow.show();
    // Open the DevTools.
}

app.whenReady().then(createWindow)
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

ipcMain.on("getJavaVersion", (event, value) => {
    console.log(javaVersion);
    if(javaVersion !== 0){
        mainWindow.webContents.send('javaVersion', javaVersion);
    }else{
        mainWindow.webContents.send('status', 'noJava');
    }
})

ipcMain.on("login", (event, value) => {
    console.log(value)
    let login;
    let password;
    let req = require('request');
    const {ipcRenderer} = require('electron')
    auto_connect = value.auto_connect;
    console.log(auto_connect);
    req({
            uri: "http://mbtl.ru/auth/launcher.php?method=auth&username="+value.username+"&password="+value.password+"&version="+version+"",
            }, function(error, response, body) {
        console.log(body)
        let req_status = JSON.parse(body).status;
        let req_message = JSON.parse(body).message;
        if(req_status !== 'ERROR'){
            mainWindow.webContents.send('status', 'LoginSuccess');
            body = JSON.parse(body).message;
            let nickname = body.split(':')[0];
            let user_uuid = body.split(':')[1];
            let user_access = body.split(':')[2];
            const user = {
                access_token: user_access,
                client_token: user_access,
                uuid: user_uuid,
                name: nickname,
                user_properties: JSON.stringify({})
            };
            
        console.log(user);
        saveUserData(value.username, value.password)
        mainWindow.webContents.send('status', 'launching');
            
        //setTimeout(() => mainWindow.hide(), 15000);
        launchGame(user)
        }else{
            if(req_message === 'Launcher is outdated'){
                mainWindow.webContents.send('status', 'LauncherIsOutDated');
                mainWindow.show();
            }
            if(req_message === 'Invalid login or password'){
                mainWindow.webContents.send('status', 'LoginError');
                mainWindow.show();
            }
            if(req_message === 'Maintenance works'){
                mainWindow.webContents.send('status', 'MaintenanceError');
                mainWindow.show();
            }
            if(req_message === 'Access denied'){
                mainWindow.webContents.send('status', 'AccessDeniedError');
                mainWindow.show();
            }
            if(req_message === 'Banned'){
                mainWindow.webContents.send('status', 'BannedError');
                mainWindow.show();
            }
            
        }
        
    });
})
ipcMain.on("setSys", (event, value) => {
    minO = value.minO;
    maxO = value.maxO;
    
    if(minO === 0 || minO === ''){
        minO = 1500;
    }
    if(maxO === 0 || maxO === ''){
        maxO = 3000;
    }
    console.log(minO)
    console.log(maxO)
})

function saveUserData(lgn, pwd) {
    let fs = require('fs');
    var obj = {
   table: []
};
    obj.table.push({login: lgn, password: pwd, minO: minO, maxO: maxO});
var json = JSON.stringify(obj);
    console.log(json);
fs.writeFile('userconfig.json', json, 'utf8', callback);
    
}
function callback() {
    
}
function rewriteLogs(){
    let fs = require('fs');
        fs.writeFile('userlogs.json', '[START LOG]', 'utf8', callback);
}
function closeGame(){
    mainWindow.show();
    mainWindow.webContents.send('status', 'gameClosed');
}


function launchGame(user) {
    let fs = require('fs');
    render_phrases();
    rewriteLogs();
    let opts = {
        clientPackage: null,
        authorization: user,
       // customLaunchArgs: '-Xincgc',
       //customLaunchArgs: fs.readFileSync('launchArguments.txt', 'utf8'),
       // timeout: '60',
        //installer:  __dirname + "/bin/forge/forge-1.16.3-34.1.25-installer.jar",
        auto_connect,
//        root:  "bin/minecraft",
//        os: "windows",
//        forge: "bin/forge/forge-1.12.2-14.23.5.2847-universal.jar",
        //        root:  "bin/minecraft",
//        os: "windows",
        forge: "bin/forge/forge-1.16.3-34.1.0-installer.jar",
        root:   "bin/minecraft",
        os: "windows",
        //forge: __dirname + "/bin/forge/forge-1.16.3-34.1.25-installer.jar",
        "version": {
            "number": "1.16.3",
            "type": "release",
        },
        memory: {
            max: maxO,
            min: minO
        }
    }
    if(auto_connect){
        opts['server'] = {host: 'mbtl.ru'};
    }
    console.log(opts)
    launcher.launch(opts);
    
    launcher.on('debug', (e) => make_logs(e));
    launcher.on('close', (e) => closeGame());
    launcher.on('data', (e) => make_logs(e));
    
    function render_phrases(){
        
        let count = 0;
        let timer = setInterval(function(){ 
            count++;
            let num = Math.ceil(Math.random() * (logs.length-1));
            mainWindow.webContents.send('log', logs[num]);
            if(count > 5){
                clearTimeout(timer);
            }
            
        }, 4000);
    }
    
    function make_logs(e){
        let fs = require('fs');
        console.log(e);
        fs.appendFile('userlogs.json', e, 'utf8', callback);
    }
}

