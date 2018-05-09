const googlehome = require('google-home-notifier');

const LANGUAGE = 'ja';
const DEVICES = {
  DINING: 'Google-Home-Mini-f51f9b7b03f902ceb33d1a104af58598',
};
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
const { AreaModel, TrashModel, RemarkModel } = require('./model');

function fetch(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
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

function mapRemark(data) {
  data.shift(); // remove header

  return data.map(d => new RemarkModel(
    d[0],
    d[1],
  ));
}

function sort(area) {
  area.calcMostRect();
  return area.trash;
}

const fetchRemarkTask = fetch('http://toyama.5374.jp/data/remarks.csv')
  .then(rawData => parseCsv(rawData))
  .then(data => mapRemark(data));

const fetchAreaTask = fetch('http://toyama.5374.jp/data/area_days.csv')
  .then(rawData => parseCsv(rawData))
  .then(data => mapArea(data))
  .then(data => data.find(d => d.label === AREA_NAME));

const moment = require('moment');

function convertNotifyData(areas, remarks) {
  const now = moment();
  const tomorrow = now.clone().add(1, 'day');
  return areas.filter(area => area.mostRecent && moment(area.mostRecent).isBetween(now, tomorrow));
}

Promise.all([fetchAreaTask, fetchRemarkTask])
  .then(values => [sort(values[0]), values[1]])
  .then((values) => { console.log(JSON.stringify(values[0], null, '  ')); return values; })
  .then(values => convertNotifyData(values[0], values[1]))
  .then(values => (values.length > 0 ? `明日は${values.map(area => area.label).join('と')}の日ですか？` : null))
  .then(message => console.log(message));
// .then(message => notify(message));
