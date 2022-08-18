import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import numeral from 'numeral';

const options = {
  legend: {
    display: false,
  },
  elements: {
    point: {
      radius: 0,
    }
  },
  maintainAspectRadio: false,
  tooltips: {
    mode: 'index',
    intersect: false,
    callbacks: {
      label: function (tooltipItem, data) {
        return numeral(tooltipItem.value).format('+0');
      },
    },
  },
  scales: {
    xAxes: [
      {
        type: 'time',
        time: {
          format: 'MM/DD/YY',
          tooltipFormat: 'll',
        },
      },
    ],
    yAxes: [
      {
        gridLines: {
          display: false,
        },
        ticks: {
          callback: function (value, index, values) {
            return numeral(value).format('0a');
          },
        }
      },
    ],
  }
}

const casesTypeColors = {
  cases: {
    hex: '#CC1034',
    rgba: 'rgba(204, 16, 52, 0.5)',
  },
  recovered: {
    hex: '#7dd71d',
    rgba: 'rgba(125,215,29,0.49)',
  },
  deaths: {
    hex: '#fb4443',
    rgba: 'rgba(251,68,67,0.5)',
  },
}

const buildChartData = (data, casesType) => {
  let chartData = []
  let lastDataPoint

  for (let date in data?.cases) {
    if (lastDataPoint) {
      let newDataPoint = {
        x: date,
        y: data[casesType][date] - lastDataPoint
      }
      chartData.push(newDataPoint)
    }
    lastDataPoint = data[casesType][date]
  }
  return chartData
}

function LineGraph({ casesType='cases', country, ...props }) {

  const [data, setData] = useState({});

  if(country === 'worldwide') {country = 'all'}

  useEffect(() => {
    const fetchData = async() => {
      await fetch(`https://disease.sh/v3/covid-19/historical/${country}?lastdays=120`)
        .then(response => response.json())
        .then(data => {
          console.log(data)
          let dataReady = country !== 'all' ? data.timeline : data
          let chartData = buildChartData(dataReady, casesType)
          setData(chartData)
        })
    }
    fetchData()
  }, [casesType, country])

  return (
    <div className={props.className}>
      {data?.length > 0 && (
        <Line
        options={options}
        data={{
          datasets: [{
            backgroundColor: casesTypeColors[casesType].rgba,
            borderColor: casesTypeColors[casesType].hex,
            data: data
          }]
        }}
        />
      )}
    </div>
  )
}

export default LineGraph;
