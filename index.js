var googlehome = require('google-home-notifier');
var language = 'ja';

googlehome.device('Google-Home-Mini-f51f9b7b03f902ceb33d1a104af58598', language);

googlehome.notify('明日は、燃えるゴミの日です。', function(res) {
  console.log(res);
});
