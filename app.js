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
bot.on('message', function(event) {
    if (event.message.type = 'text') {
      var msg = event.message.text;
    //收到文字訊息時，直接把收到的訊息傳回去
      event.reply(msg).then(function(data) {
        // 傳送訊息成功時，可在此寫程式碼 
        console.log(msg);
      }).catch(function(error) {
        // 傳送訊息失敗時，可在此寫程式碼 
        console.log('錯誤產生，錯誤碼：'+error);
      });
    }
  });

// Bot所監聽的webhook路徑與port
const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);

var server = app.listen(process.env.PORT || 8080, function() {
  var port = server.address().port;
  console.log('目前的port是', port);
});