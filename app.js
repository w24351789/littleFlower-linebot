// 引用linebot SDK
const linebot = require('linebot');
const express = require('express')
const confirm = require('confirm.json')
// 用於辨識Line Channel的資訊
const bot = linebot({
  channelId: '1566408570',
  channelSecret: '8814f04143a31a92c8c113ec5c010258',
  channelAccessToken: 'gM1zz4xVFGIOudd30703LVOBbp9AwWlkNXFFxAGQXxINXDBQq91RxlsrAWxoQR2mDhKDUFPUNnTMlojAwNSfpgebrKn3NzFLafzh9djn6hIhRhCDNrog1Cqoh9bR+CT9R8OJyBlOhzhv/rTzU6ZLHAdB04t89/1O/w1cDnyilFU='
});


bot.on('message', function (event) {
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
            event.reply(JSON.parse(confirm));
            break;
          case 'Multiple':
            return event.reply(['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5']);
            break;
          case 'Version':
            event.reply('linebot@' + require('../package.json').version);
            break;
          default:
            event.reply(event.message.text).then(function (data) {
              console.log('Success', data);
            }).catch(function (error) {
              console.log('Error', error);
            });
            break;
        }
        break;
      case 'image':
        event.message.content().then(function (data) {
          const s = data.toString('hex').substring(0, 32);
          return event.reply('Nice picture! ' + s);
        }).catch(function (err) {
          return event.reply(err.toString());
        });
        break;
      case 'video':
        event.reply('Nice video!');
        break;
      case 'audio':
        event.reply('Nice audio!');
        break;
      case 'location':
        event.reply(['That\'s a good location!', 'Lat:' + event.message.latitude, 'Long:' + event.message.longitude]);
        break;
      case 'sticker':
        event.reply({
          type: 'sticker',
          packageId: 1,
          stickerId: 1
        });
        break;
      default:
        event.reply('Unknow message: ' + JSON.stringify(event));
        break;
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