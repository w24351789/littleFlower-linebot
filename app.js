// 引用linebot SDK
const linebot = require('linebot');
const express = require('express')

// 用於辨識Line Channel的資訊
const bot = linebot({
  channelId: '1566408570',
  channelSecret: '8814f04143a31a92c8c113ec5c010258',
  channelAccessToken: 'gM1zz4xVFGIOudd30703LVOBbp9AwWlkNXFFxAGQXxINXDBQq91RxlsrAWxoQR2mDhKDUFPUNnTMlojAwNSfpgebrKn3NzFLafzh9djn6hIhRhCDNrog1Cqoh9bR+CT9R8OJyBlOhzhv/rTzU6ZLHAdB04t89/1O/w1cDnyilFU='
});

//這一段的程式是專門處理當有人傳送文字訊息給LineBot時，我們的處理回應
// bot.on('message', function(event) {
//     if (event.message.type = 'text') {
//       let msg = event.message.text;
//     //收到文字訊息時，直接把收到的訊息傳回去
//       event.reply(msg).then(function(data) {
//         // 傳送訊息成功時，可在此寫程式碼 
//         console.log(msg);
//       }).catch(function(error) {
//         // 傳送訊息失敗時，可在此寫程式碼 
//         console.log('錯誤產生，錯誤碼：'+error);
//       });
//     }
//   });

bot.on('message', async (event) => {
   
        try{
            if (event.message.type = 'text') {
                let msg = await event.message.text
                event.reply(msg)
                console.log(msg)
            }
            
        }catch(error){
            console.log(`錯誤產生，錯誤碼為: ${error}`)
        }
        switch (event.message.type) {
          case 'text':
            switch (event.message.text) {
              case 'Me':
                event.source.profile().then(function (profile) {
                  return event.reply('Hello ' + profile.displayName + ' ' + profile.userId);
                });
                break;
              case 'Member':
                event.source.member().then(function (member) {
                  return event.reply(JSON.stringify(member));
                });
                break;
              case 'Picture':
                event.reply({
                  type: 'image',
                  originalContentUrl: 'https://d.line-scdn.net/stf/line-lp/family/en-US/190X190_line_me.png',
                  previewImageUrl: 'https://d.line-scdn.net/stf/line-lp/family/en-US/190X190_line_me.png'
                });
                break;
              case 'Location':
                event.reply({
                  type: 'location',
                  title: 'LINE Plus Corporation',
                  address: '1 Empire tower, Sathorn, Bangkok 10120, Thailand',
                  latitude: 13.7202068,
                  longitude: 100.5298698
                });
                break;
              case 'Push':
                bot.push('U17448c796a01b715d293c34810985a4c', ['Hey!', 'สวัสดี ' + String.fromCharCode(0xD83D, 0xDE01)]);
                break;
              case 'Push2':
                bot.push('Cba71ba25dafbd6a1472c655fe22979e2', 'Push to group');
                break;
              case 'Multicast':
                bot.push(['U17448c796a01b715d293c34810985a4c', 'Cba71ba25dafbd6a1472c655fe22979e2'], 'Multicast!');
                break;
              case 'Confirm':
                event.reply({
                  type: 'template',
                  altText: 'this is a confirm template',
                  template: {
                    type: 'confirm',
                    text: 'Are you sure?',
                    actions: [{
                      type: 'message',
                      label: 'Yes',
                      text: 'yes'
                    }, {
                      type: 'message',
                      label: 'No',
                      text: 'no'
                    }]
                  }
                });
                break;
        }
    
})
// Bot所監聽的webhook路徑與port
const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log('目前的port是', port);
});