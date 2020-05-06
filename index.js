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
let logs = ['Настраиваем окружение...', 'Печатаем бланки ПСЖ...', 'Раздаём стипендию на сервере...', 'Проблемы с подключением? Этот вопрос можно уточнить у студенческого офиса! Они работают с 9 до 18 часов каждый день по адресу ул.Ломоносова 9 ауд 1400', 'Освобождаем бюджетные места на сервере', 'Ждём ответа от ИСУ...', 'Осуществляем дистанционное подключение...', 'Отчисляем админа...', 'Переводим контрактников', 'Подписываем приказ об отчислении', 'Открываем ЦДО', 'Чиним крышу спавна'];

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
//  storeWindow.loadURL('public/index.html');
//  storeWindow.show();
    // Open the DevTools.
}

app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

ipcMain.on("getJavaVersion", (event, value) => {
    console.log(javaVersion);
    if(javaVersion !== 0){
        mainWindow.webContents.send('javaVersion', javaVersion);
    }else{
        mainWindow.webContents.send('status', 'noJava');
    }
    
    //mainWindow.webContents.send('javaVersion', javaVersion);
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
            uri: "http://mbtl.ru/auth/launcher.php?method=auth&username="+value.username+"&password="+value.password+"",
            }, function(error, response, body) {
        console.log(JSON.parse(body))
        let req_status = JSON.parse(body).status;
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
            
        setTimeout(() => mainWindow.hide(), 15000);
        launchGame(user)
        }else{
            mainWindow.webContents.send('status', 'LoginError');
            mainWindow.show();
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
    render_phrases();
    rewriteLogs();
    let opts = {
        clientPackage: null,
        // For production launchers, I recommend not passing 
        // the getAuth function through the authorization field and instead
        // handling authentication outside before you initialize
        // MCLC so you can handle auth based errors and validation!
        //authorization: auth,
        authorization: user,
        customLaunchArgs: '-Xincgc',
        customArgs: '-Dfml.readTimeout=60',
        timeout: '60',
        auto_connect,
        root:  "bin/minecraft",
        os: "windows",
        forge: "bin/forge/forge-1.12.2-14.23.5.2847-universal.jar",
//        root:  "resources/app/bin/minecraft",
//        os: "windows",
//        forge: "resources/app/bin/forge/forge-1.12.2-14.23.5.2847-universal.jar",
        "version": {
            "number": "1.12.2",
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
        fs.appendFile('userlogs.json', e, 'utf8', callback);
    }
}
