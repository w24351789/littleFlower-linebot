//以下的三列require裡的內容，請確認是否已經用npm裝進node.js
const linebot = require('linebot');
const line = require('@line/bot-sdk');
const express = require('express');
const { google } = require('googleapis');
//用於製入金鑰beta
const myClientSecret = require('./user_data/credentials.json');
const sheetsAuth = require('./user_data/sheetsapi.json');
const lineInfo = require('./user_data/linebot_info');
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
let chooseError = require('./bot_templates/chooseError.json');
// 用於辨識Line Channel的資訊
const bot = linebot(lineInfo);
const client = new line.Client({
   channelAccessToken: lineInfo.channelAccessToken
 });
 
const oauth2Client = new google.auth.OAuth2(myClientSecret.installed.client_id,myClientSecret.installed.client_secret, myClientSecret.installed.redirect_uris[0]);
//底下輸入sheetsapi.json檔案的內容
oauth2Client.credentials = sheetsAuth;
//試算表的ID，引號不能刪掉
const questionSheetId = '13lzb_GiuEVYaJxJmE8nQyEwBw-zeijeV5HtELCHzmdk';
const customSheetId = '1-QfBSutaowKE7H-NQBQVs39wsQ9_4I3lnwDM9aMm1iI'
let myQuestions=[];
let users=[];
let totalSteps = 0;
let questionnaireKey = 0;
let customteaKey = 0;
let customteaStep = 4;
//這是讀取問題的函式
function getQuestions(){
  const sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
     auth: oauth2Client,
     spreadsheetId: questionSheetId,
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
function appendMyRow(userId, sheetId) {
   const request = {
      auth: oauth2Client,
      spreadsheetId: sheetId,
      range:'reponse1',
      insertDataOption: 'INSERT_ROWS',
      valueInputOption: 'RAW',
      resource: {
        "values": [
          users[userId].replies
        ]
      }
   };
   const sheets = google.sheets('v4');
   sheets.spreadsheets.values.append(request, function(err, response) {
      if (err) {
         console.log('The API returned an error: ' + err);
         return;
      }
   });
}
//判斷訊息是否符合條件
function adjustMessage(adjustSuccess, customerChoose, customProduct) {
   for (let i = 0; i < customProduct.length; i++){
      if (customerChoose === customProduct[i].action.text){
         adjustSuccess += 1;
      }
   }
   console.log(adjustSuccess);
   return adjustSuccess;
}
//LineBot收到user的文字訊息時的處理函式
bot.on('message', function(event) {
   const myId=event.source.userId;
            client.getProfile(myId)
               .then((profile) => {
                  console.log(profile.displayName);
                  console.log(profile.pictureUrl);
                  userName = profile.displayName;
               })
               .catch((err) => {
                  // error handling
                  console.log(err);
               });
   switch (event.message.type) {
      case 'text':

         if (event.message.text === '@意見回饋@' || questionnaireKey !== 0 && customteaKey === 0) {
            const myId=event.source.userId;
            client.getProfile(myId)
               .then((profile) => {
                  console.log(profile.displayName);
                  console.log(profile.pictureUrl);
                  userName = profile.displayName;
               })
               .catch((err) => {
                  // error handling
                  console.log(err);
               });
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
               questionAns1 = userName + myQuestions[0][0];
               questionText.text = questionAns1;
               event.reply(questionText);
            }
            else{
               //最後一題答完後
               if (myStep==(totalSteps-1)) {
                  //users[myId].replies[myStep+1]=event.message.text;
                  //users[myId].replies[myStep+2] = userName;//自動讀取使用者的名字
                  event.reply(giftCard);
               }
               else if (myStep > -1 && myStep < 7){//A至H
                  questionAns2 = myQuestions[1][myStep]+myQuestions[0][myStep+1];
                  questionChosen.text = questionAns2;
                  event.reply(questionChosen);
                  users[myId].replies[myStep+1]=event.message.text;
               }
               else {
                  questionAns1 = myQuestions[1][myStep]+'\n'+myQuestions[0][myStep+1];
                  questionText.text = questionAns1;
                  event.reply(questionText);
                  users[myId].replies[myStep+1]=event.message.text;
               }
            }
            myStep += 1;
            questionnaireKey = myStep + 100;
            users[myId].step=myStep;
            if (myStep>=totalSteps){
               myStep = -1;
               questionnaireKey = 0;
               users[myId].step = myStep;
               users[myId].replies[0] = new Date();
               appendMyRow(myId, questionSheetId);
            }
         }
         if (event.message.text === '@客製化花茶@' || customteaKey !== 0) {
            const myId=event.source.userId;
            if (users[myId]==undefined){
               users[myId]=[];
               users[myId].userId=myId;
               users[myId].step=-1;
               users[myId].replies=[];
            }
            var myStep=users[myId].step;
            if (event.message.text === '取消此客製化花茶') {
               myStep = 5;
               event.reply({
                  "type": "text",
                  "text": "取消成功，再看看有沒有其他喜歡的花茶吧~~"
               })
            }
            
            if (myStep === -1) {
               chooseFlower.text = "您好請選擇您想要的花"
               event.reply(chooseFlower);//選花chooseFlower
            }
            else{
               switch (myStep){
                  case 0:
                     flowerProduct = chooseFlower.quickReply.items;
                     let adjustResult = adjustMessage(0, event.message.text, flowerProduct);
                     console.log(adjustResult);
                     if(adjustResult === 0) {
                        myStep = -2;
                        event.reply(chooseError);
                     }else{
                        event.reply(chooseTea);//選茶
                        users[myId].replies[myStep+1]=event.message.text;//花結果
                     }
                  break;
                  case 1:
                     teaProduct = chooseTea.quickReply.items;
                     let adjustResult1 = adjustMessage(0, event.message.text, teaProduct);
                     console.log(adjustResult1);
                     if(adjustResult1 === 0) {
                        myStep = -2;
                        event.reply(chooseError);
                     }else{
                        event.reply(teaFlavor);//選風味
                        users[myId].replies[myStep+1]=event.message.text;//茶結果
                     }
                  break;
                  case 2:
                     users[myId].replies[myStep+1]=event.message.text;//風味結果
                     const confirmText = users[myId].replies[1] + users[myId].replies[2] +users[myId].replies[3]; 
                     confirmCustom.contents.body.contents[1].text = confirmText;
                     event.reply(confirmCustom);//確認or重選
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
               users[myId].replies[0]=new Date();
               appendMyRow(myId, customSheetId);
            }
         }
         if (customteaKey === 0) {
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
         }
      break;
      case 'sticker':
         event.reply({
         type: 'sticker',
         packageId: 1,
         stickerId: 9
         });
      break;
   }
});


const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

//因為 express 預設走 port 3000，而 heroku 上預設卻不是，要透過下列程式轉換
var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});