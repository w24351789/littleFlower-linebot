//以下的四列require裡的內容，請確認是否已經用npm裝進node.js
var linebot = require('linebot');
var express = require('express');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
// 用於辨識Line Channel的資訊
const bot = linebot({
  channelId: '1566408570',
  channelSecret: '8814f04143a31a92c8c113ec5c010258',
  channelAccessToken: 'gM1zz4xVFGIOudd30703LVOBbp9AwWlkNXFFxAGQXxINXDBQq91RxlsrAWxoQR2mDhKDUFPUNnTMlojAwNSfpgebrKn3NzFLafzh9djn6hIhRhCDNrog1Cqoh9bR+CT9R8OJyBlOhzhv/rTzU6ZLHAdB04t89/1O/w1cDnyilFU='
});


//底下輸入client_secret.json檔案的內容
var myClientSecret={
  "type": "service_account",
  "project_id": "pro-adapter-238506",
  "private_key_id": "8be1a0e25b2deb799263b250be62a73085d98e67",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCxiT/9N8G8kdoc\nLCH/kCzBUMjjbb4Kf5C+CegM+a1y6464Ho0FKyJKYHoHsjC2S7n5nAudNfFnL+YU\nGu1uvRmgcsDCElfLk8DrZwjCLQ+VXGsGTwzHQn/PTd+bFxTHbLvBPDyOWHN2y9Zi\n10s2lQw6S59H9eHxJ9BRFnMzJmlRoKRapMZ0W1YFq7V4Blh44OEm5BgTbjmXkG6z\nhUq0fHqlVNQt64/k7WPAsb+djCZdckcn7YC6FCRRdJebcw2g8NMbs63luwvksjyC\nOAamP2IqOEzG/c6O0Wsq5SvWRDNjYtix24BNmH+moxrYUaeUmxKQoLOyeXN0CWW/\nnW3KxTd/AgMBAAECggEAHR8ETgbdUo8iFcjvcro1fShBK30O1S4DkgiR9b7mwpj8\n+hqYyyY+I7EbkzOZZe2Z/eWoygrVJDXpKZcZJzcBgx4PnEXh/NSpqnNmLmOx0LAu\nJgTFddHkoR6G9SueDvA5BANbc4XyuqPI8MGb5sIgFVfeMrGUdDgxpXtnPhao4+iN\npWxPVdODaF0b3kwKwCyyeVPlGMXr1hbqCyT9Ei0uo5Fzuo+0JcYGKf94fhmRlptx\nYtYDS3umXQfzQWHnuiMLdMwhccnnoptDw0lQ3ShroaDcaKPDn2jZKvOu4VkX8P+f\nkxZwOIQp7I+twJlsLmcIBcvHlmLTfPI7A+rBqUZgQQKBgQDmlitNreUWU0jFK5wa\nvJov06qzu76P2DbFWmNBoBwyB7CTIsTHoUUKIyqSjQtr/21Hd9mkUHEyj/8AjkR5\nqJsacCSNVd4umfcraqtrMmrALCQsYJbHvjG4wei4tcPOgKXTzVM1ccso7ErNhh74\nsFe9s5pM0/zr1xp9q1A/QNYkkQKBgQDFGk0Qg7cKf9dJwgKsUoH5VoBxVDuUUIzD\nWgNn1NWekPht6KKAsSZsMJBnd2zf5NRe792cFE/67oIDnIOpo8blHFoQXtJOA9bH\nBHju7tKpR0VfeKPLKCcW3LOhccFgHucbyOhsCFM12O53Ibt/4xdQLRecNVmS6ABj\nDRFGo0VjDwKBgQC5ZWI52ahI0/u9dDvWD3BVJfWo/znPhAM9mFgXyrkAzMf+9USM\nUbEl3nJ7VGYrljpx7P4TrA3nnnlkI/8QZi0XC7WH4dN7WpWt1d0vmmDUVGldOOfi\nf5yQtW/9Gz/tB+jMq9jMLssvAxV9u+mpAHf7ca2NOiCwKsoE4rnpsaK70QKBgHPd\nMyIbG3VrkyXDi4i687abt+NmzaMw+p43grr9rRmKRM9vKl+WQ2zj229HD9RJkuHA\nBTij5CQxInJ3BhqpsNirovHum5fKv+273k8uSt3BjLFDnJ1nHBtfX6Tu1urnH5oA\nr0gaWLfVrtCPHsZduy2hZDiqT96AzQFtBBPPFJHXAoGAJSpKtxuC1A0TFe9e0TI1\npeN2D1isIINwR1k6W0EXEDTcJAv6vkPxrbCvAxxgNFALkbWtDAa/lQD2jS66xS5A\nPmgzaP2Qb6vY2K4Pid/F8el1sHyGlb19sE7P6/ngNnX6cmLTzlPOGdusFydUferw\nfNfmv9/etMVPkO8nuhQTeQQ=\n-----END PRIVATE KEY-----\n",
  "client_email": "littleflower-linebot@pro-adapter-238506.iam.gserviceaccount.com",
  "client_id": "111404872503771857043",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/littleflower-linebot%40pro-adapter-238506.iam.gserviceaccount.com"
}

var auth = new googleAuth();
var oauth2Client = new auth.OAuth2(myClientSecret.installed.client_id,myClientSecret.installed.client_secret, myClientSecret.installed.redirect_uris[0]);

//底下輸入sheetsapi.json檔案的內容
oauth2Client.credentials ={"installed":{"client_id":"487712895966-52l8m1shmledngvgneleg2ghf5li6obi.apps.googleusercontent.com","project_id":"quickstart-1556002223831","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"a3o97TWo0b5N87rv0fKxR0nH","redirect_uris":["urn:ietf:wg:oauth:2.0:oob","http://localhost"]}}

//試算表的ID，引號不能刪掉
var mySheetId='1VLX79AlBmlkqIJgDK2BRDkxK3venpoL1jselGGIhmc4';

var myQuestions=[];
var users=[];
var totalSteps=0;
var myReplies=[];

//程式啟動後會去讀取試算表內的問題
getQuestions();


//這是讀取問題的函式
function getQuestions() {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
     auth: oauth2Client,
     spreadsheetId: mySheetId,
     range:encodeURI('問題'),
  }, function(err, response) {
     if (err) {
        console.log('讀取問題檔的API產生問題：' + err);
        return;
     }
     var rows = response.values;
     if (rows.length == 0) {
        console.log('No data found.');
     } else {
       myQuestions=rows;
       totalSteps=myQuestions[0].length;
       console.log('要問的問題已下載完畢！');
     }
  });
}

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
      var myStep=users[myId].step;
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