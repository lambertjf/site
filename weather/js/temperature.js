/**********************************************************
*   temperature.js
* 
*   Does everything you need to operate EasyTemp.
*   by Jordan Lambert
*
***********************************************************/

/*
    things to implement:
        celsius
        weather background
        historical weather
        google maps to replace input
*/

//THIS SHOULD BE FALSE IF YOU PUT IT ONLINE
var workingLocal = false;

if(workingLocal) dir = "/js/sounds/";
else {
    if (window.location.protocol != "https:"){
        window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);
    }
    var dir = "/~lambej13/weather/js/sounds/";
}

var lat = 0;
var lng = 0;
var counter = 0;
var sounds;
var locationFound;

function getLocation(){
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(setLocation);
        locationFound = true;
        console.log("got location");
    }else{
        locationFound = false;
        console.log("couldn't get location");
    }
}

function setLocation(position){
    lat = position.coords.latitude;
    lng = position.coords.longitude;
    console.log(lat + " " + lng);
    reload();
}

//iterate through sounds array... each sound's onended points back to this function
function playSounds(sounds){
    sounds[counter].play();
    console.log(sounds[counter].src);
    counter++;
}

//setup the array for the audio.
function setupAudio(temp){
    console.log(temp);
    var sounds = [];
    if(temp > 99){
        sounds.push(new Audio(dir + "100.mp3"));
        temp -= 100;
    }
    
    var ones = temp % 10;
    var tens = temp - ones;
    
    if(temp > 10 && temp < 20){
        sounds.push(new Audio(dir + tens + ones + ".mp3"));
        
    }
    else{
        if(temp > 10){
            var tensClip = dir + tens + ".mp3";
            sounds.push(new Audio(tensClip));
        }
        var onesClip = dir + ones + ".mp3";
        sounds.push(new Audio(onesClip));
    }
    sounds.push(new Audio(dir + "degrees.mp3"));
    console.log(sounds.length);
    for(var i = 0; i < sounds.length-1; i++){
        sounds[i].onended = function(){ playSounds(sounds); };
    }
    return sounds;
}

//display temp
function changeTemp(temp) {
    document.getElementById("temp").innerHTML = temp + "°F";
}

//on document ready, if there are no inputs, just make them zero
function start(){
    document.getElementById('latin').value = '0';
    document.getElementById('longin').value = '0';
    getLocation();
    if(!locationFound) document.getElementById("inputbox").style.display = "inline";
    
    var lastYear = parseInt(document.getElementById('year').value);
    for(var years = lastYear-1; years > lastYear-60; years--)
        document.getElementById('year').innerHTML += "<option value=\"" + years + "\">" + years + "</option>";
}

//tell me that temp
function dictate(){
    counter = 0;
    playSounds(sounds);
}

//just in case someone is hiding something
function manualInput(){
    if(locationFound) locationFound = false;
    else locationFound = true;
    if(!locationFound) { 
        document.getElementById("inputbox").style.display = "inline";  document.getElementById("manualInput").innerHTML = "Input▲"; 
    }
    else { 
        document.getElementById("inputbox").style.display = "none"; document.getElementById("manualInput").innerHTML = "Input▼"; 
    }
}

/* 
    possible values:
        clear-day, clear-night, rain, snow, sleet, wind, fog, cloudy, partly-cloudy-day, partly-cloudy-night
*/
function changeBackground(background){
    document.documentElement.style.backgroundImage = "url('/images/clear-sky.jpg')";
    document.documentElement.style.backgroundSize = "cover";
}

function changeIcon(icon){
    var weatherIcon = document.getElementById("icon");
    var classname = "";
    switch(icon){
        case "clear-day":
            classname = "wi wi-day-sunny"; break;
        case "clear-night":
            classname = "wi wi-night-clear"; break;
        case "rain":
            classname = "wi wi-rain"; break;
        case "snow":
            classname = "wi wi-snow"; break;
        case "sleet":
            classname = "wi wi-sleet"; break;
        case "wind":
            classname = "wi wi-windy"; break;
        case "fog":
            classname = "wi wi-fog"; break;
        case "cloudy":
            classname = "wi wi-cloudy"; break;
        case "partly-cloudy-day":
            classname = "wi wi-day-cloudy"; break;
        case "partly-cloudy-night":
            classname = "wi wi-night-alt-cloudy"; break;
        default:
            classname = "wi wi-cloud"; break;
    }
    weatherIcon.className = classname;
}

//reload temp, audio
function reload(){
    //changeBackground();
    if(!locationFound){
        if(lat=="") lat = "0";
        lat = document.getElementById('latin').value;
        if(lng=="") lng = "0";
        lng = document.getElementById('longin').value;
    }else{
        document.getElementById('latin').value = lat;
        document.getElementById('longin').value = lng;
    }
    
    //i love networking
    var url = "https://api.darksky.net/forecast/bb06a5cc7a3a3390bc0b18231d8726ae/" + lat + "," + lng;
    $.ajax({
        url: url,
        dataType: 'jsonp',
        success: function(results){
            changeTemp(results.currently.temperature);
            sounds = setupAudio(Math.floor(results.currently.temperature));
            console.log(results);
            changeIcon(results.currently.icon);
        }
    });
    history(lat, lng);
}

function yearChange(){
    history(lat, lng);
}

function history(lat, long){
    //set up date... there is probably a better way to do this but whatever
    var currentDate = new Date();
    
    var seconds = currentDate.getSeconds() > 9 ? currentDate.getSeconds() : "0" + currentDate.getSeconds();
    var minutes = currentDate.getMinutes() > 9 ? currentDate.getMinutes() : "0" + currentDate.getMinutes();
    var hours = currentDate.getHours() > 9 ? currentDate.getHours() : "0" + currentDate.getHours();
    
    var months = (currentDate.getMonth()  > 9 ? currentDate.getMonth() : "0" + currentDate.getMonth()) + 1;
    var days = currentDate.getDate()  > 9 ? currentDate.getDate() : "0" + currentDate.getDate();
    var year = document.getElementById('year').value;
    
    var hisTemp = document.getElementById('histemp');
    var dateTime = year + "-" + months + "-" + days + "T" + hours + ":" + minutes + ":" + seconds + "-0500";
    
    console.log(dateTime);
    
    //get the historical data
    var url = "https://api.darksky.net/forecast/bb06a5cc7a3a3390bc0b18231d8726ae/" + lat + "," + lng + "," + dateTime;
    $.ajax({
        url: url,
        dataType: 'jsonp',
        success: function(results){
            console.log(results);
            console.log("historical");
            hisTemp.innerHTML = results.hourly.data[hours-1].temperature + "°F";
        }
    });
}

$(document).ready(function(){
    console.log("easy temp!!!!!");
    start();
});