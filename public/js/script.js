//Modules
    const ipc = require('electron').ipcRenderer;
    const nick = document.getElementById('nickname');
    const form_login = document.getElementById('userlogin');
    const form_password = document.getElementById('userpwd');
    const formInput = document.getElementById('btn_save');
    const changeInput = document.getElementById('button_change');
    const playInput = document.getElementById('button_play');
    const closeInput = document.getElementById('btn_close');
    const sysInput = document.getElementById('btn_sys');
    const form = document.getElementById('myForm');
    var request = require("request");
    const setSysInput = document.getElementById('button_setSys');
    let fs = require('fs');
    let isLogined = false;
    let login;
    let password;
    let user_nick;
    renderBG();
    function renderBG(){
        fs.readdir('public/images/bg/', (err, files) => {
        let num = Math.ceil(Math.random() * (files.length-1));
            console.log(files[num]);
            
            document.getElementById('wrapper').style.background = 'linear-gradient(180deg, #46008C 5%, rgba(70, 0, 140, 0) 100%),url(images/bg/' + files[num] + ')';
            document.getElementById('wrapper').style.backgroundPosition = 'center';
            document.getElementById('wrapper').style.backgroundSize = 'cover';
            document.getElementById('wrapper').style.backgroundRepeat = 'no-repeat';
            $('#wrapper').show();
});
    }
    //OnLoad
    window.onload = function(){
        checkWebServer();
        ipc.send("getJavaVersion", {});
    }
    function setup(){
        renderUser();
        renderServerInfo();
    } 
    
    //API functions
    function checkWebServer(){
        request({uri: "http://mbtl.ru/auth/launcher.php?method=auth&username=test&password=test"}, 
            function(error, response, body) {
            if(body === undefined || body === ''){
                showMessage('Сервер аутентификации недоступен<br>Попробуйте позже');
            }else{
                setup();
            }
        });
    }
function renderUser(){
    checkConfig();
    
}
function renderServerInfo(){
    
    request({uri: "https://api.mcsrvstat.us/2/mbtl.ru"}, 
            function(error, response, body) {
        if(body === undefined || body === ''){
            document.getElementById('server_online').innerHTML = 'Сервер в данный момент недоступен';
        }else{
        let data = JSON.parse(body);
        let string = 'Онлайн: ' + data.players.online + '/' + data.players.max;
        document.getElementById('server_online').innerHTML = string;
        }

        });
}
function checkConfig(){
    try {
        if (fs.existsSync('userconfig.json')) {
            fs.readFile('userconfig.json', 'utf8', function(err, contents) {
                if (contents !== undefined && contents !== '') {
                    isLogined = true;
                    let data = JSON.parse(contents);
                    login = data['table'][0]['login'];
                    password = data['table'][0]['password'];
                    
                    form_login.value = login;
                    form_password.value = password;
                    
                    setSys(data['table'][0]['minO'], data['table'][0]['maxO']);
                    
                    showDefaultScreen();
                    
                    renderSkin(login);
                    
                }else{
                    showSys();
                    showLoginScreen();
                }
            });
        } else {
            showSys()
             showLoginScreen();
        }
    } catch (err) {
        console.error(err)
    }
}
let skinRotate;
function renderSkin(username){
    user_nick = username;
    nick.innerHTML = username;
    
    document.getElementById('skin').src = "http://mbtl.ru/skins/3d.php?hr=30&vr=-20&vrla=0&vrra=0&vrll=0&vrrl=-0&ratio=30&user=" + username.toLowerCase();
}
function Rotateskin(nick){
        setTimeout(function(){
            clearInterval(skinRotate);
            document.getElementById('skin').src = "http://mbtl.ru/skins/3d.php?hr=30&vr=-20&vrla=0&vrra=0&vrll=0&vrrl=-0&ratio=30&user=" + nick.toLowerCase();
        }, 15000)
        let rotate = 30;
        let multiply = -15;  
        skinRotate = setInterval(function(){
          
        document.getElementById('skin').src = "http://mbtl.ru/skins/3d.php?hr="+(rotate + multiply)+"&vr=-20&vrla=0&vrra=0&vrll=0&vrrl=-0&ratio=7&user=" + nick.toLowerCase();
        rotate = rotate + multiply;
            console.log(rotate);
        if(rotate === -360){
            rotate = 0;
        }
    }, 150);
}

//BUTTONS
formInput.addEventListener('click', () => {
        formInput.disabled = true;
        login = userlogin.value;
        password = userpwd.value;
        let auto_connect = document.getElementById('auto_connect').checked;
        if (login != null && login != '' && password != null && password != '') {
            Rotateskin(login);
            ipc.send("login", {
                username: login,
                password: password,
                auto_connect: auto_connect
            });
        } else {
            alert('Значения не могут быть пустыми');
            formInput.disabled = false;
        }
})
playInput.addEventListener('click', () => {
        let auto_connect = document.getElementById('auto_connect').checked;
        playInput.disabled = true;
        if (login != null && login != '' && password != null && password != '') {
            Rotateskin(login);
            ipc.send("login", {
                username: login,
                password: password,
                auto_connect: auto_connect
            });
        } else {
            showLoginInfo('Конфиги повреждены! Попробуйте войти снова');
            showLoginScreen();
            playInput.disabled = false;
        }
})
sysInput.addEventListener('click', () => {
            setSys(usermino.value, usermaxo.value);
            $('#sysForm').slideUp();
            if(!isLogined){
                showLoginScreen();
            }
            
})
closeInput.addEventListener('click', () => {
    showDefaultScreen();
})
changeInput.addEventListener('click', () => {
    showLoginScreen();
})
setSysInput.addEventListener('click', () =>{
  showSys();                                
})

ipc.on('status', (event, status) => {
        if (status === 'launching') {
            showProccess('Игра запускается');
        }
        if (status === 'LoginError') {
            showLoginInfo('Неверный логин / пароль');
            formInput.disabled = false;
        }
    if (status === 'LoginSuccess') {
        formInput.disabled = false;
        playInput.disabled = false;
            renderSkin(login);
            hideLoginInfo();
        }
        if(status === 'gameClosed'){
            showDefaultScreen();
        }
        if(status === 'noJava'){
            alert('У вас не установлена java!');
            document.getElementById('wrapper').style.display = 'none';
        }
    })
ipc.on('javaVersion', (event, status) => {
    document.getElementById('javaVersion').textContent = 'Java: '+status + '/ Launcher: 2.0';
    
})
ipc.on('log', (event, status) => {
    showProccess(status);
    
})
    
    //Render functions
    function setDefaultScreen(){
        $('#frame').fadeIn();
        $('#control').fadeIn();
    }
    function setLoginScreen(){
        document.getElementById('myForm').style.display = 'block';
    }
    function showDefaultScreen(){
        $('#info').hide();
        $('#myForm').slideUp();
        $('#frame').fadeIn();
        $('#control').fadeIn();
    }
    function showLoginScreen(){
        $('#info').hide();
        $('#myForm').slideDown();
        $('#frame').fadeOut();
        $('#control').hide();
    }
    function showLoginInfo(value){
        document.getElementById('login_status').style.display = 'block';
        document.getElementById('login_status').textContent = value;
    }
    function hideLoginInfo(){
        document.getElementById('login_status').style.display = 'none';
    }
    function showDefaultInfo(value){
        document.getElementById('info').style.display = 'block';
        document.getElementById('info-p').innerHTML = value;
    }
    function showMessage(value){
        document.getElementById('control').style.display = 'none';
        document.getElementById('myForm').style.display = 'none';
        document.getElementById('frame').style.display = 'block';
        document.getElementById('info').style.display = 'block';
        document.getElementById('info-p').innerHTML = value;
    }
function showProccess(value){
        document.getElementById('control').style.display = 'none';
        document.getElementById('myForm').style.display = 'none';
        document.getElementById('frame').style.display = 'block';
        document.getElementById('info').style.display = 'block';
        document.getElementById('info-p').innerHTML = value;
    }
function showSys(){
    $('#sysForm').slideDown();
}
function setSys(min, max){
    document.getElementById('usermino').value = min;
    document.getElementById('usermaxo').value = max;
    ipc.send("setSys", {
                minO: min,
                maxO: max
    });
    
}

function showSuccessAction(){
    $('#action_status').slideDown(500, hideSuccessAction);
}
function hideSuccessAction(){
    setTimeout(function(){
        $('#action_status').slideUp(500);
    }, 1000)
    
}