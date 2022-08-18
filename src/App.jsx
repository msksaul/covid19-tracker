import React, { useState, useEffect } from 'react';
import { MenuItem, FormControl, Select, Card, CardContent } from '@material-ui/core';
import InfoBox from './components/InfoBox';
import Map from './components/Map';
import Table from './components/Table';
import LineGraph from './components/LineGraph';
import { prettyPrintStat, sortData } from './utils';
import './App.css';
import 'leaflet/dist/leaflet.css'

function App() {

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796});
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState('cases');

  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data)
    })
  }, [])

  useEffect(() => {
    const getCountriesData = async() => {
      await fetch('https://disease.sh/v3/covid-19/countries')
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => (
          {
            name: country.country,
            value: country.countryInfo.iso2
          }
        ))

        const sortedData = sortData(data)
        setTableData(sortedData)
        setMapCountries(data)
        setCountries(countries)
      })
    }
    getCountriesData()
  }, []);

  const onCountryChange = async(event) => {
    const countryCode = event.target.value
    setCountry(countryCode)

    const url = countryCode === 'worldwide'
      ? 'https://disease.sh/v3/covid-19/all'
      : `https://disease.sh/v3/covid-19/countries/${countryCode}`
    
    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data)

      setMapCenter([data.countryInfo.lat, data.countryInfo.long])
      setMapZoom(4)
    })
  };

  return (
    <div className='app'>
      <div className='app__left'>
        <div className='app__header'>
          <h1>COVID 19 TRACKER</h1>
          <FormControl className='app__dropdown'>
            <Select variant='outlined' value={country} onChange={onCountryChange}>
              <MenuItem value='worldwide'>Worldwide</MenuItem>
              {countries.map(country => (
                <MenuItem value={country.name}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className='app__stats'>
          <InfoBox
            isRed
            active={casesType === 'cases'} 
            onClick={e => setCasesType('cases')}
            title='Coronavirus Cases' 
            total={prettyPrintStat(countryInfo.cases)} 
            cases={prettyPrintStat(countryInfo.todayCases)}/>
          <InfoBox
            active={casesType === 'recovered'}  
            onClick={e => setCasesType('recovered')}
            title='Recovered' 
            total={prettyPrintStat(countryInfo.recovered)} 
            cases={prettyPrintStat(countryInfo.todayRecovered)}/>
          <InfoBox
            isOrange
            active={casesType === 'deaths'} 
            onClick={e => setCasesType('deaths')}
            title='Deaths' 
            total={prettyPrintStat(countryInfo.deaths)} 
            cases={prettyPrintStat(countryInfo.todayDeaths)}/>
        </div>

        <Map casesType={casesType} center={mapCenter} zoom={mapZoom} countries={mapCountries}/>
      </div>

      <Card>
        <CardContent>
          <h3>LIVE CASES BY COUNTRY</h3>
          <Table countries={tableData}/>
          <h3 className='app__graphTitle'>{country === 'worldwide' ? 'WORLDWIDE' : `${country.toUpperCase()}`} NEW {casesType.toUpperCase()}</h3>
          <LineGraph country={country} className='app__graph' casesType={casesType}/>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
