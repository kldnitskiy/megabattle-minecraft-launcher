// C:\Users\sdkca\Desktop\electron-workspace\build.js
var electronInstaller = require('electron-winstaller');
let fs = require('fs');
// In this case, we can use relative paths
var settings = {
    // Specify the folder where the built app is located
    appDirectory: 'C:/Users/firem/YandexDisk-dankladnitsky@yandex.ru/Projects/Megabattle Minecraft/Source/megabattle_minecraft_launcher/release_builds/megabattle_minecraft_launcher_win32_x64',
    // Specify the existing folder where 
    outputDirectory: 'C:/Users/firem/YandexDisk-dankladnitsky@yandex.ru/Projects/Megabattle Minecraft/Source/megabattle_minecraft_launcher/release',
    // The name of the Author of the app (the name of your company)
    authors: 'Danil Kladnitskiy',
    // The name of the executable of your built
    exe: 'C:/Users/firem/YandexDisk-dankladnitsky@yandex.ru/Projects/Megabattle Minecraft/Source/megabattle_minecraft_launcher/release_builds/megabattle_minecraft_launcher_win32_x64/megabattle_minecraft_launcher_win32_x64.exe'
};

resultPromise = electronInstaller.createWindowsInstaller(settings);
 
resultPromise.then(() => {
    console.log("The installers of your application were succesfully created !");
}, (e) => {
    console.log(`Well, sometimes you are not so lucky: ${e.message}`)
    console.log(settings);
    fs.writeFile('test.txt', e.message, 'utf8', callback);
});

function callback(){
    
}