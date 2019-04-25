//以下的四列require裡的內容，請確認是否已經用npm裝進node.js
const linebot = require('linebot');
const express = require('express');
const { google } = require('googleapis');

// 用於辨識Line Channel的資訊
const bot = linebot({
  channelId: '1566408570',
  channelSecret: '8814f04143a31a92c8c113ec5c010258',
  channelAccessToken: 'gM1zz4xVFGIOudd30703LVOBbp9AwWlkNXFFxAGQXxINXDBQq91RxlsrAWxoQR2mDhKDUFPUNnTMlojAwNSfpgebrKn3NzFLafzh9djn6hIhRhCDNrog1Cqoh9bR+CT9R8OJyBlOhzhv/rTzU6ZLHAdB04t89/1O/w1cDnyilFU='
});


//底下輸入client_secret.json檔案的內容
const myClientSecret = { "installed":
{"client_id":"724449545250-69efl9n814a920hav1bvab9qu0ke1k4n.apps.googleusercontent.com",
"project_id":"cobalt-ship-238507",
"auth_uri":"https://accounts.google.com/o/oauth2/auth",
"token_uri":"https://oauth2.googleapis.com/token",
"auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs",
"client_secret":"XlE838SI-XBVUmLmWDT8IFMF",
"redirect_uris":["urn:ietf:wg:oauth:2.0:oob","http://localhost"]}}


const oauth2Client = new google.auth.OAuth2(myClientSecret.installed.client_id,myClientSecret.installed.client_secret, myClientSecret.installed.redirect_uris[0]);

//底下輸入sheetsapi.json檔案的內容
oauth2Client.credentials = {"access_token":"ya29.Glv0Bj-GvntUwoq1Eiw6h44S5WBTYja65gofkD1WoOiPa_41bFVXs4hjtmMuofXqhGSQbW_f2fZybk_6ZVGHMWIRaAtsBqnAKusbhu8Jyfbe_QRmFEnXwJMyonPv",
"refresh_token":"1/uvqjDjS62ubNmhDi7C6-wsfGASTJJMTxgtwHYMEgn_U",
"scope":"https://www.googleapis.com/auth/spreadsheets.readonly",
"token_type":"Bearer",
"expiry_date":1556009862658}

//試算表的ID，引號不能刪掉
const mySheetId='1VLX79AlBmlkqIJgDK2BRDkxK3venpoL1jselGGIhmc4';

var myQuestions=[];
var users=[];
var totalSteps=0;
var myReplies=[];




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
     var rows = response.data.values;
     console.log("rows = " + rows)
     //console.log(JSON.stringify(response, null, 2));
     console.log(response.data.values)
     console.log("=============================")
     if (rows == 0) { //有問題TypeError: Cannot read property 'length' of undefined
        console.log('No data found.');
     } else {
       myQuestions=rows;
       //totalSteps=myQuestions[0].length;//有問題 TypeError: Cannot read property '0' of undefined
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
      range:encodeURI('表單回應 1'),
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
   if (event.message.type === 'text') {
      var myId=event.source.userId;
      if (users[myId]==undefined){
         users[myId]=[];
         users[myId].userId=myId;
         users[myId].step=-1;
         users[myId].replies=[];
      }
     
      const myStep=users[myId].step;
      if (myStep===-1)
         sendMessage(event,myQuestions[0][0]);
      else{
         if (myStep==(totalSteps-1))
            sendMessage(event,myQuestions[1][myStep]);
         else
            sendMessage(event,myQuestions[1][myStep]+'\n'+myQuestions[0][myStep+1]);
         users[myId].replies[myStep+1]=event.message.text;
      }
      myStep++;
      users[myId].step=myStep;
      if (myStep>=totalSteps){
         myStep=-1;
         users[myId].step=myStep;
         users[myId].replies[0]=new Date();
         appendMyRow(myId);
      }
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