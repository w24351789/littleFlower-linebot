//以下的三列require裡的內容，請確認是否已經用npm裝進node.js
const linebot = require('linebot');
const express = require('express');
const { google } = require('googleapis');
//用於製入金鑰beta
const myClientSecret = require('./user_data/credentials.json');
const sheetsAuth = require('./user_data/sheetsapi.json');
const lineInfo = require('./user_data/linebot_info');
//用於製入location
let mapLocation = require('./js_modules/location');
// 用於辨識Line Channel的資訊
const bot = linebot(lineInfo);

const oauth2Client = new google.auth.OAuth2(myClientSecret.installed.client_id,myClientSecret.installed.client_secret, myClientSecret.installed.redirect_uris[0]);
//底下輸入sheetsapi.json檔案的內容
oauth2Client.credentials = sheetsAuth;
//試算表的ID，引號不能刪掉
const mySheetId='1VLX79AlBmlkqIJgDK2BRDkxK3venpoL1jselGGIhmc4';

var myQuestions=[];
var users=[];
var totalSteps=0;
var myReplies=[];
var questionnaireKey=0;

//這是讀取問題的函式
function getQuestions(){
  const sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
     auth: oauth2Client,
     spreadsheetId: mySheetId,
     //range:encodeURI('question1'),
     range: 'question1!A1:D2',
     majorDimension: 'ROWS'
  }, function(err, response) {
     if (err) {
        console.log('讀取問題檔的API產生問題：' + err);
        return;
     }
     const rows = response.data.values;
     //console.log(JSON.stringify(response, null, 2));
     console.log(response.data.values)
     if (rows.length == 0) { 
        console.log('No data found.');
     } else {
       myQuestions=rows;
       totalSteps=myQuestions[0].length;
       console.log('要問的問題已下載完畢！');
     }
  });
}

//程式啟動後會去讀取試算表內的問題
getQuestions();

//這是將取得的資料儲存進試算表的函式
function appendMyRow(userId) {
   var request = {
      auth: oauth2Client,
      spreadsheetId: mySheetId,
      range:'reponse1',
      insertDataOption: 'INSERT_ROWS',
      valueInputOption: 'RAW',
      resource: {
        "values": [
          users[userId].replies
        ]
      }
   };
   var sheets = google.sheets('v4');
   sheets.spreadsheets.values.append(request, function(err, response) {
      if (err) {
         console.log('The API returned an error: ' + err);
         return;
      }
   });
}

//LineBot收到user的文字訊息時的處理函式
bot.on('message', function(event) {
   switch (event.message.type) {
      case 'text':
         if (event.message.text === '問卷' || questionnaireKey !== 0) {
            var myId=event.source.userId;
            if (users[myId]==undefined){
               users[myId]=[];
               users[myId].userId=myId;
               users[myId].step=-1;
               users[myId].replies=[];
            }
         
            var myStep=users[myId].step;
            if (myStep === -1) //第一次觸發問卷
               sendMessage(event,myQuestions[0][0]);
            else{
               if (myStep==(totalSteps-1)) //最後一題答完後
                  {
                     sendMessage(event,myQuestions[1][myStep]);
                     event.reply(mapLocation);
                  }
               else
                  sendMessage(event,myQuestions[1][myStep]+'\n'+myQuestions[0][myStep+1]);
               users[myId].replies[myStep+1]=event.message.text;
            }
            myStep += 1;
            questionnaireKey = myStep + 100;
            //console.log(questionnaireKey);
            users[myId].step=myStep;
            if (myStep>=totalSteps){
               myStep = -1;
               questionnaireKey = 0;
               users[myId].step=myStep;
               users[myId].replies[0]=new Date();
               //console.log(users[myId])
               appendMyRow(myId);
            }
         }
         if (event.message.text === 'Location') {
            event.reply(mapLocation);
         }
      break;
      case 'sticker':
         event.reply({
         type: 'sticker',
         packageId: 1,
         stickerId: 1
         });
      break;
   }
});


//這是發送訊息給user的函式
function sendMessage(eve,msg){
   eve.reply(msg).then(function(data) {
      // success 
      return true;
   }).catch(function(error) {
      // error 
      return false;
   });
}


const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});