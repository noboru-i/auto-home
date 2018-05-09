const moment = require('moment');

const MAX_MONTH = 2;

const dayEnum = ['日', '月', '火', '水', '木', '金', '土'];

class AreaModel {
  constructor(label, centerName, center, trash) {
    this.label = label;
    this.centerName = centerName;
    this.center = center;
    this.trash = trash;
  }

  calcMostRect() {
    for (let i = 0; i < this.trash.length; i++) {
      this.trash[i].calcMostRect();
    }
  }
}

class TrashModel {
  constructor(label, cell) {
    this.label = label;
    this.dayCell = cell.split(' ').filter(c => c.length > 0);
  }

  calcMostRect() {
    const dayList = [];
    const today = moment();

    for (let i = 0; i < MAX_MONTH; i++) {
      const curYear = today.year();
      const month = today.clone().add(i, 'month').month();

      this.dayCell.forEach((day) => {
        Array.from(Array(5).keys()).forEach((week) => {
          // week=0が第1週目
          const firstDayOfMonth = new Date(curYear, month, 1);
          const dayIndex = dayEnum.findIndex(d => d === day.charAt(0));
          if (dayIndex === -1) {
            return;
          }

          // 月初日を基準にして、第2木曜日などの日付を計算
          const d = moment(firstDayOfMonth)
            .add((7 + dayIndex - firstDayOfMonth.getDay()) % 7, 'days')
            .add(week, 'weeks');

          if (d.month() !== month % 12) {
            // 別の月になっている場合
            return;
          }
          if (day.length > 1 && week !== day.charAt(1) - 1) {
            // 第N週の指定があり、その週以外の場合
            return;
          }

          dayList.push(d);
        });
      });
    }

    dayList.sort((a, b) => a - b);

    const target = moment();
    this.mostRecent = dayList.find(day => target.isBefore(day));
    this.dayList = dayList;
  }
}

class RemarkModel {
  constructor(id, text) {
    this.id = id;
    this.text = text;
  }
}

exports.AreaModel = AreaModel;
exports.TrashModel = TrashModel;
exports.RemarkModel = RemarkModel;
