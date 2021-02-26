// import '../node_modules/@fortawesome/fontawesome-free/js/solid';
// import '../node_modules/@fortawesome/fontawesome-free/js/fontawesome';
import './reset.css';
import './style.css';
import {
  addSeconds, format, parseISO,
} from 'date-fns';
import emoji from './emojiflag';

function convertIconCode(iconCode) {
  let faIconClass = '';
  switch (iconCode) {
    case '01d':
      faIconClass = 'fa-sun';
      return faIconClass;
    case '01n':
      faIconClass = 'fa-moon';
      return faIconClass;
    case '02d':
      faIconClass = 'fa-cloud-sun';
      return faIconClass;
    case '02n':
      faIconClass = 'fa-cloud-moon';
      return faIconClass;
    case '03d':
      faIconClass = 'fa-cloud';
      return faIconClass;
    case '03n':
      faIconClass = 'fa-cloud';
      return faIconClass;
    case '04d':
      faIconClass = 'fa-cloud';
      return faIconClass;
    case '04n':
      faIconClass = 'fa-cloud';
      return faIconClass;
    case '09d':
      faIconClass = 'fa-cloud-sun-rain';
      return faIconClass;
    case '09n':
      faIconClass = 'fa-cloud-moon-rain';
      return faIconClass;
    case '10d':
      faIconClass = 'fa-cloud-sun-rain';
      return faIconClass;
    case '10n':
      faIconClass = 'fa-cloud-moon-rain';
      return faIconClass;
    case '11d':
      faIconClass = 'fa-bolt';
      return faIconClass;
    case '11n':
      faIconClass = 'fa-bolt';
      return faIconClass;
    case '13d':
      faIconClass = 'fa-snowflake';
      return faIconClass;
    case '13n':
      faIconClass = 'fa-snowflake';
      return faIconClass;
    case '50d':
      faIconClass = 'fa-smog';
      return faIconClass;
    case '50n':
      faIconClass = 'fa-smog';
      return faIconClass;
    default:
      break;
  }
  return null;
}

async function getWeatherXml(location, units = 'metric') {
  try {
    const request = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=${units}&APPID=fe21aa7a84db50a74c994032f13577a7&mode=xml`);
    const data = await request.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, 'text/xml');
    const temperature = `${Number(xmlDoc.getElementsByTagName('temperature')[0].attributes.value.value).toFixed(1)}°c`;
    const humidity = `${xmlDoc.getElementsByTagName('humidity')[0].attributes.value.value}%`;
    const status = xmlDoc.getElementsByTagName('weather')[0].attributes.value.value;
    const iconCode = xmlDoc.getElementsByTagName('weather')[0].attributes.icon.value;
    const timeZoneOffset = xmlDoc.getElementsByTagName('timezone')[0].innerHTML;
    const country = emoji(xmlDoc.getElementsByTagName('country')[0].textContent);
    // const localTime = addSeconds(new Date(xmlDoc.getElementsByTagName('lastupdate')[0].attributes.value.value.split('T').join(' ')), timeZoneOffset);
    const localTime = addSeconds(parseISO(xmlDoc.getElementsByTagName('lastupdate')[0].attributes.value.value), timeZoneOffset);
    const date = format(localTime, 'E, LLLL d');
    const time = format(localTime, 'h:mm bbb');
    return {
      location, temperature, humidity, status, iconCode, date, time, country,
    };
  } catch (e) {
    const icon = document.querySelector('.fa-spinner');
    const input = document.querySelector('.weather-location-input');
    icon.classList.replace('fa-spinner', 'fa-search-location');
    input.value = 'not found';
    input.focus();
    input.select();
  }
  return null;
}

function createLocationInput(element, location) {
  const icon = document.createElement('button');
  const input = document.createElement('input');
  icon.classList.add('fas', 'fa-search-location');
  input.type = 'text';
  input.value = location.toLowerCase();
  input.classList.add('weather-location-input');
  icon.onclick = () => {
    icon.classList.replace('fa-search-location', 'fa-spinner');
    (async () => {
      const weather = await getWeatherXml(input.value);
      if (weather) {
        removeAllChildNodes(document.getElementById('container'));
      }
      renderWeather(weather);
    })();
  };
  element.appendChild(input);
  element.appendChild(icon);
}
function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function createLocation(element, location) {
  element.textContent = location.toLowerCase();
  element.onclick = (e) => {
    if (!document.querySelector('.weather-location-input')
        && !e.currentTarget.classList.contains('weather-location-input')) {
      element.textContent = '';
      createLocationInput(element, location);
      document.querySelector('.weather-location-input').focus();
    }
  };
}

function createTemperature(element, temperature) {
  element.textContent = temperature.toLowerCase();
  element.onclick = (e) => {
    console.log(e.currentTarget);
    console.log(temperature);
    const newTemperature = (document.querySelector('.weather-temperature').textContent);
    const temp = newTemperature.split('°')[0];
    const unit = newTemperature.split('°')[1];
    let newTemp;
    let newUnit;
    if (unit === 'c') {
      newTemp = (temp * 9 / 5 + 32).toFixed(1);
      newUnit = 'f';
    } else {
      newTemp = ((temp - 32) * 5 / 9).toFixed(1);
      newUnit = 'c';
    }
    element.textContent = [newTemp, newUnit].join('°');
  };
}

function renderWeather(weatherObj) {
  const container = document.getElementById('container');
  if (weatherObj.iconCode.charAt(weatherObj.iconCode.length - 1) === 'd') {
    container.style.backgroundImage = 'radial-gradient( circle farthest-corner at 10% 20%,  rgba(208,89,109,1) 0%, rgba(231,156,118,1) 90% )';
  } else {
    container.style.backgroundImage = 'linear-gradient( 94.3deg,  rgba(26,33,64,1) 10.9%, rgba(81,84,115,1) 87.1% )';
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const key in weatherObj) {
    if (Object.hasOwnProperty.call(weatherObj, key)) {
      const property = weatherObj[key];
      const element = document.createElement('div');
      if (key === 'iconCode') {
        const icon = document.createElement('i');
        icon.classList.add('fas', convertIconCode(property));
        element.append(icon);
      } else if (key === 'location') {
        createLocation(element, property);
      } else if (key === 'temperature') {
        createTemperature(element, property);
      } else {
        element.textContent = property.toLowerCase();
      }
      element.classList.add(`weather-${key}`);
      container.append(element);
    }
  }
}

// Main Program Function
(async function main() {
  const weather = await getWeatherXml('nowhere');
  renderWeather(weather);
}());
