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
//引入line模板
let giftCard = require('./bot_templates/giftCard.json');
let questionChosen = require('./bot_templates/quickreply.json');
let questionText = require('./bot_templates/textReply.json');
let teaShop = require('./bot_templates/shopping.json');
let weekTeaShop = require('./bot_templates/weekTeaShop.json');
let badMoodTea = require('./bot_templates/badMoodTea.json');
let badMoodTea2 = require('./bot_templates/badMoodTea2.json');
let twFlowerTea = require('./bot_templates/twFlowerTea.json');
let brandMind = require('./bot_templates/brandMind.json');
let contactUs = require('./bot_templates/contactUs.json');
let rawMaterial = require('./bot_templates/rawMaterial.json');
let chooseFlower = require('./bot_templates/chooseFlower.json');
let chooseTea = require('./bot_templates/chooseTea.json');
let teaFlavor = require('./bot_templates/teaFlavor.json');
let confirmCustom = require('./bot_templates/confirmCustom.json');
let customLink = require('./bot_templates/customLink.json');
// 用於辨識Line Channel的資訊
const bot = linebot(lineInfo);

const oauth2Client = new google.auth.OAuth2(myClientSecret.installed.client_id,myClientSecret.installed.client_secret, myClientSecret.installed.redirect_uris[0]);
//底下輸入sheetsapi.json檔案的內容
oauth2Client.credentials = sheetsAuth;
//試算表的ID，引號不能刪掉
//const mySheetId='1VLX79AlBmlkqIJgDK2BRDkxK3venpoL1jselGGIhmc4';
const questionSheetId='13lzb_GiuEVYaJxJmE8nQyEwBw-zeijeV5HtELCHzmdk';
var myQuestions=[];
var users=[];
var totalSteps = 0;
var questionnaireKey = 0;
var customteaKey = 0;
var customteaStep = 4;
//這是讀取問題的函式
function getQuestions(){
  const sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
     auth: oauth2Client,
     spreadsheetId: questionSheetId,
     //range:encodeURI('question1'),
     range: 'question1!A1:M2',
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
      spreadsheetId: questionSheetId,
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
         switch (event.message.text) {
            case '@購買商品@':
               event.reply(teaShop);
            break;
            case '購買周而復始系列花茶':
               event.reply(weekTeaShop);
            break;
            case '進一步了解負能量系列花茶':
               event.reply(badMoodTea);
            break;
            case '看更多負能量茶飲':
               event.reply(badMoodTea2);
            break;
            case '進一步了解台灣特色花茶':
               event.reply(twFlowerTea);
            break;
            case '@品牌理念@':
               event.reply(brandMind);
            break;
            case '@聯絡我們@':
               event.reply(contactUs);
            break;
            case '@原料介紹@':
               event.reply(rawMaterial);
            break;

         }
         if (event.message.text === '@意見回饋@' || questionnaireKey !== 0) {
            var myId=event.source.userId;
            if (users[myId]==undefined){
               users[myId]=[];
               users[myId].userId=myId;
               users[myId].step=-1;
               users[myId].replies=[];
            }
         
            var myStep=users[myId].step;
            let questionAns1;
            let questionAns2;
            console.log(myStep);
            //第一次觸發問卷
            if (myStep === -1) {
               sendMessage(event,myQuestions[0][0]);
            }
            else{
               //最後一題答完後
               if (myStep==(totalSteps-1)) {
                  //sendMessage(event,myQuestions[1][myStep]);
                  event.reply(giftCard);
               }
               else if (myStep > -1 && myStep < 4){
                  questionAns1 = myQuestions[1][myStep]+'\n'+myQuestions[0][myStep+1];
                  questionText.text = questionAns1;
                  event.reply(questionText);
                  
                  console.log(questionText);
                  users[myId].replies[myStep+1]=event.message.text;
               }
               else {
                  questionAns2 = myQuestions[1][myStep]+'\n'+myQuestions[0][myStep+1];
                  questionChosen.text = questionAns2;
                  event.reply(questionChosen);
                  
                  users[myId].replies[myStep+1]=event.message.text;
               }
            }
            myStep += 1;
            questionnaireKey = myStep + 100;
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
         if (event.message.text === '@客製化花茶@' || customteaKey > 100) {
            var myId=event.source.userId;
            if (event.message.text === '取消此客製化花茶') {
               myStep = 5;
               event.reply({
                  "type": "text",
                  "text": "取消成功"
               })
            }
            if (users[myId]==undefined){
               users[myId]=[];
               users[myId].userId=myId;
               users[myId].step=-1;
               users[myId].replies=[];
            }
            
            var myStep=users[myId].step;

            if (myStep === -1) {
               event.reply(chooseFlower);//選花chooseFlower
               users[myId].replies[myStep+1]=event.message.text;
            }
            else{
               switch (myStep){
                  case 0:
                     event.reply(chooseTea);//選茶
                     users[myId].replies[myStep+1]=event.message.text;
                  break;
                  case 1:
                     event.reply(teaFlavor);//選風味
                     users[myId].replies[myStep+1]=event.message.text;
                  break;
                  case 2:
                     const confirmText = users[myId].replies[1] + users[myId].replies[2] +users[myId].replies[3]; 
                     confirmCustom.contents.body.contents[1].text = confirmText;
                     event.reply(confirmCustom);//確認or重選
                     users[myId].replies[myStep+1]=event.message.text;
                  break;
                  // case 3:
                  //    event.reply({
                  //       "type": "text",
                  //       "text": "請輸入您的蝦皮帳號，下單後將為您出貨"
                  //    });//蝦皮帳號
                  //    users[myId].replies[myStep+1]=event.message.text;
                  // break;
                  case 3:
                     const customItem = users[myId].replies[1] + users[myId].replies[2] +users[myId].replies[3];;
                     customLink.contents.body.contents[3].text = customItem;
                     event.reply(customLink);//購買連結
                     //users[myId].replies[myStep+1]=event.message.text;
                  break;
                  
               }
            }
            myStep += 1;
            customteaKey = myStep + 100;
            users[myId].step=myStep;

            if (myStep>=customteaStep){
               myStep = -1;
               customteaKey = 0;
               users[myId].step=myStep;
               //users[myId].replies[0]=new Date();
               //console.log(users[myId])
               //appendMyRow(myId);
            }
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