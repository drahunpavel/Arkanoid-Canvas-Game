'use strict';
window.onhashchange=switchToStateFromURLHash;

var SPAState = {};

// Преобразуем хэш 
function switchToStateFromURLHash() {
  var URLHash = window.location.hash;

  var stateStr = URLHash.substr(1);
  if ( stateStr != "" ) { 
    var parts = stateStr.split("_")
    SPAState = { pagename: parts[0] }; 
  }
  else
    SPAState = { pagename:'Main'}; 

  var pageHTML = "";
  let windowBackgr=document.getElementById("wrapper");
  switch ( SPAState.pagename ) {
    case 'Main':
      windowBackgr.style.backgroundImage="url('/src/screen-wall.jpg')";
      loadPage('/main.html','html', mainSuccess)
      break;
    case 'Game':
      loadPage('/game.html', 'html', gameSuccess);
      break;
    case 'Records':
      windowBackgr.style.backgroundImage="url('/src/screen31-clear.jpg')";
      loadPage('/records.html', 'html', mainSuccess);
      break;
  }
  document.getElementById('main').innerHTML = pageHTML;
}

// Загружаем страницу
function loadPage(src, dType, success) {
  $.ajax(src,
        {
          type: 'GET',
          dataType: dType,
          cache:false,
          success: success,
          complete:complete,
          error: Error, 
          xhrFields: { onprogress: progress }
        }
  );
}

function mainSuccess(data) {

  //console.log("data1",data)

  document.getElementById('main').innerHTML = data;

  // Читаем изменения в хранилище
  restoreInfo();
  
  // Удаляем скрипты
  function removeScripts() {
    var head = document.getElementsByTagName('head')[0];
    var scripts = head.getElementsByTagName('script');

    // console.log("head",head)
    // console.log("scripts",scripts)

    
    for(var i = 0; i < scripts.length; i++) {
      var script = scripts[i];
      head.removeChild(script);
      removeScripts();
    }
  }

  removeScripts();
}

function gameSuccess(data) {
  document.getElementById('main').innerHTML = data;

  // console.log("data2",data)


  // Необходимые скрипты для страницы
  var scripts = ["js/canvas.js", "js/ball.js", "js/player.js", "js/controls.js", "js/map.js", "js/main.js"];
  getScripts();

  // Получаем скрипты
  function getScripts(){
    var counter = 0;
   
    function getNextScript() {
      if ( counter < scripts.length ) {
        $.ajax(scripts[counter],
              { 
                type:'GET',
                dataType:'script',
                success: function() {  
                  var script = document.createElement('script');
                  script.src = scripts[counter];
                  document.getElementsByTagName('head')[0].appendChild(script);
                  counter ++;
                  getNextScript();
                }, 
                error: Error 
              }
        );
        return;
      }
    }
    getNextScript();
  }
}

// Сменить состояние страницы
function switchToState(newState) {
  var stateStr = newState.pagename;
  location.hash = stateStr;
}

// Главная страница
function switchToMainPage() {
  switchToState( { pagename:'Main' } );
}

// Страница с игрой
function switchToGamePage() {
  switchToState( { pagename:'Game' } );
}

// Страница с рекордами
function switchToRecordsTablePage() {
  switchToState( { pagename:'Records' } );
}

// Переключаемся в состояние, которое сейчас прописано в закладке URL
switchToStateFromURLHash();



// *****************************
//        PROGRESS_BAR
// *****************************

function progress(EO) {
  if ( EO.lengthComputable ) {
    var perc = Math.round(EO.loaded/EO.total*100);
    // document.getElementById('IProgressPerc').style.width = perc + "%";
  }
}

function complete() {
  // document.getElementById('IProgress').style.display="none"; 
}



// *****************************
//        RECORDS
// *****************************

var ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php";
var updatePassword;
var stringName = 'YALOVIK_ARKANOID_INFO';
var records;
var playerName;

function storeInfo() {
  // Проверяем имя игрока в хранилище
  // playerName = window.localStorage.getItem('name');
  // Если есть - записываем его в поле ввода
  // if ( playerName )
    // document.querySelector('input').value = playerName;

  updatePassword = Math.random();
  // $.ajax( 
  //   {
  //     url : ajaxHandlerScript, 
  //     type : 'POST', 
  //     cache : false, 
  //     dataType:'json',
  //     data : { f : 'LOCKGET', n : stringName, p : updatePassword },
  //     success : lockGetReady, 
  //     error : errorHandler
  //   }
  // );
}

function lockGetReady(callresult) {
  if ( callresult.error != undefined )
    alert( callresult.error ); 
  else {
    records =[];
    if( callresult.result != "" ) { // либо строка пустая - сообщений нет, либо в строке - JSON-представление массива сообщений
    records = JSON.parse(callresult.result); 
    // вдруг кто-то сохранил мусор вместо YALOVIK_ARKANOID_INFO?
    if ( !Array.isArray(records) )
      records = [];
    } 
    // Записываем рекорды
    records.push( { name:playerName, age:player.total } );

    // $.ajax( 
    //   {
    //     url : ajaxHandlerScript, 
    //     type : 'POST', 
    //     cache : false, 
    //     dataType:'json',
    //     data : { f : 'UPDATE', n : stringName, v : JSON.stringify(records), p : updatePassword },
    //     success : updateReady, 
    //     error : errorHandler
    //   }
    // );
  }
}

function updateReady(callresult) {
  if ( callresult.error != undefined )
    alert(callresult.error); 
}

function restoreInfo() {
  // $.ajax(
  //   {
  //     url : ajaxHandlerScript,
  //     type : 'POST',
  //     cache : false,
  //     dataType:'json',
  //     data : { f : 'READ', n : stringName },
  //     success : readReady,
  //     error : errorHandler
  //   }
  // );
}

function readReady(callresult) {
  if ( callresult.error != undefined )
    alert(callresult.error); 
  else {
    records = [];
    if ( callresult.result != "" ) {
      records=JSON.parse(callresult.result);

      if ( !Array.isArray(records) )
        records = [];
    }

    records.sort(function(a,b) {
      return b.age - a.age;
    });

    showTable(records)
  }
}

function showTable(records) {
  var PageHTML = "";
  PageHTML += '<table>';
  PageHTML += '<caption>Таблица рекордов</caption>';		
  PageHTML += '<tr><th>Имя игрока</th><th>Очки</th></tr>';

  var recordsCount = records.length;
  if (recordsCount > 10) recordsCount = 10;
  for (var i = 0; i < recordsCount; i++) {
    PageHTML += '<tr><td class = "name">' + records[i].name + '</td><td class = "total">'+ records[i].age + '</td></td></tr>';
  }		

  PageHTML += '</table>';
  $('.table').empty().append(PageHTML);
}

function errorHandler(jqXHR,statusStr,errorStr) {
  alert(statusStr+' '+errorStr);
}

restoreInfo();



// *****************************
//        POPUP
// *****************************

var popUp = document.createElement('div');
popUp.classList.add('popUp');

var messageContainer = document.createElement('div');
messageContainer.classList.add('messageContainer');
popUp.appendChild(messageContainer);

var message = document.createElement('p');
message.classList.add('message');
messageContainer.appendChild(message);

var input = document.createElement('input'); 
input.classList.add('input');
messageContainer.appendChild(input);

var btn = document.createElement('button');
btn.classList.add('btn__popup');
btn.innerHTML = 'Save & Reload';
messageContainer.appendChild(btn);

// Показать попап
var initPopup = function(msg) {  
  message.innerHTML = msg;
  document.body.appendChild(popUp);
  player.play = false;
  // storeInfo();  
  btn.addEventListener('click', removePopup, false);
}

// Скрыть попап
var removePopup = function() {  
  // storeInfo();
  window.localStorage.setItem('name',document.querySelector('input').value);
  grid.bricks = [];
  init();  
  document.body.removeChild(popUp);
}