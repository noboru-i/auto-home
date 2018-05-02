const googlehome = require('google-home-notifier');

const LANGUAGE = 'ja';
const DEVICES = {
  DINING: 'Google-Home-Mini-f51f9b7b03f902ceb33d1a104af58598',
};

googlehome.device(DEVICES.DINING, LANGUAGE);
googlehome.notify('明日は、燃えるゴミの日です。', (res) => {
  console.log(res);
});
