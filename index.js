const googlehome = require('google-home-notifier');

const LANGUAGE = 'ja';
const DEVICES = {
  DINING: 'Google-Home-Mini-f51f9b7b03f902ceb33d1a104af58598',
};

const REMOTE_BASE_URL = 'http://toyama.5374.jp';
const AREA_NAME = '藤ノ木';

function notify(message) {
  if (!message) {
    console.log('not trash day.');
    return;
  }

  googlehome.device(DEVICES.DINING, LANGUAGE);
  googlehome.notify(message, (res) => {
    console.log(res);
  });
}

const http = require('http');
const { AreaModel, TrashModel } = require('./model');

function fetch(fetchUrl) {
  return new Promise((resolve) => {
    http.get(fetchUrl, (res) => {
      const { statusCode } = res;
      if (statusCode !== 200) {
        return;
      }
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        resolve(rawData);
      });
    });
  });
}

function parseCsv(rawData) {
  const csvdata = rawData.replace(/\r/gm, '');
  const lines = csvdata.split('\n');
  const ret = lines.filter(line => line.length > 0)
    .map(line => line.split(','));
  return ret;
}

function mapArea(data) {
  const labels = data.shift();
  const trashLabels = labels.slice(2);
  return data.map((d) => {
    const area = new AreaModel(
      d[0],
      d[1],
      '',
      trashLabels.map((label, i) => new TrashModel(trashLabels[i], d[i + 2])),
    );
    return area;
  });
}

function sort(area) {
  area.calcMostRect();
  return area.trash;
}

const fetchAreaTask = fetch(`${REMOTE_BASE_URL}/data/area_days.csv`)
  .then(rawData => parseCsv(rawData))
  .then(data => mapArea(data))
  .then(data => data.find(d => d.label === AREA_NAME));

const moment = require('moment');

function convertNotifyData(areas) {
  const now = moment();
  const tomorrow = now.clone().add(1, 'day');
  return areas.filter(area => area.mostRecent && moment(area.mostRecent).isBetween(now, tomorrow));
}

fetchAreaTask
  .then(values => sort(values))
  .then((values) => { console.log(JSON.stringify(values, null, '  ')); return values; })
  .then(values => convertNotifyData(values))
  .then(values => (values.length > 0 ? `明日は${values.map(area => area.label).join('と')}の日ですか？` : null))
  .then(message => console.log(message));
// .then(message => notify(message));
