import cloneDeep from 'lodash/cloneDeep';
import getPeriodDays from './getPeriodDays';
import moment from 'moment';

export default function getChartData(data, mode, period) {
  let dominantColor;
  for (let i = 0; i < data.length; i++) {
    dominantColor = data[i].info.dominant_color.hex;
  }

  let chartData = {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: mode,
          data: [],
          backgroundColor: 'transparent',
          borderColor: dominantColor,
          borderWidth: 3,
          lineTension: 0,
        },
      ],
    },
    options: {
      responsive: true,
      lineTension: 1,
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              padding: 8,
            },
          },
        ],
        xAxes: [
          {
            ticks: {
              autoSkip: false,
              padding: 8,
            },
          },
        ],
      },
      legend: {
        display: false,
      },
    },
  };

  // WEEK AND MONTH
  if (period === 'week' || period === 'month') {
    let days;

    if (period === 'week') {
      days = getPeriodDays(moment(), 'week');
    } else if (period === 'month') {
      days = getPeriodDays(moment(), 'month');
    }

    // set x-Axis label
    days.forEach(day => {
      // set x-Axis label
      let hasData = false;
      let formatedDay;

      if (period === 'day' || period === 'week') {
        formatedDay = moment(day).format('dd. DD.MMM');
      } else if (period === 'month') {
        formatedDay = moment(day).format('dd. DD.');
      }

      day = moment(day).format('YYYY-MM-DD');
      chartData.data.labels.push(formatedDay);

      for (let i = 0; i < data.length; i++) {
        if (data[i].date === day) {
          if (mode === 'time') {
            chartData.data.datasets[0].data.push(data[i].info.time / 60000);
          } else if (mode === 'views') {
            chartData.data.datasets[0].data.push(data[i].info.count);
          } else if (mode === 'clicks') {
            chartData.data.datasets[0].data.push(data[i].info.clicks);
          } else if (mode === 'scroll') {
            chartData.data.datasets[0].data.push(data[i].info.scroll);
          }
          hasData = true;
        }
      }

      if (!hasData) {
        chartData.data.datasets[0].data.push(0);
      }
    });

    return chartData;
  } else if (period === 'year') {
    let date = moment();

    let monthsData = data.reduce((o, { date, info }) => {
      let k = date.slice(0, 7);

      o[k] = o[k] || { date: k, info: { time: 0, count: 0, clicks: 0, scroll: 0 } };
      o[k].info.time += info.time;
      o[k].info.count += info.count;
      o[k].info.clicks += info.clicks;
      o[k].info.scroll += info.scroll;

      return o;
    }, {});

    let startOfPeriod = cloneDeep(date).startOf('year');
    let month = startOfPeriod;

    // iterate through year
    for (let i = 0; i < 12; i++) {
      let formatedMonth = month.format('YYYY-MM');
      let hasData = false;

      // x axis label
      chartData.data.labels.push(month.format('MMM.'));

      // get data
      for (const key of Object.keys(monthsData)) {
        if (formatedMonth === key) {
          if (mode === 'time') {
            chartData.data.datasets[0].data.push(monthsData[key].info.time / 60000);
          } else if (mode === 'views') {
            chartData.data.datasets[0].data.push(monthsData[key].info.count);
          } else if (mode === 'clicks') {
            chartData.data.datasets[0].data.push(monthsData[key].info.clicks);
          } else if (mode === 'scroll') {
            chartData.data.datasets[0].data.push(monthsData[key].info.scroll);
          }
          hasData = true;
        }
      }
      if (!hasData) {
        chartData.data.datasets[0].data.push(0);
      }
      month = month.add(1, 'months');
    }
  }
  return chartData;
}