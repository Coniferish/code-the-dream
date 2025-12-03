const url = "https://flood-api.open-meteo.com/v1/flood?latitude=52.52,48.85&longitude=13.41,2.35";
const davisStrait = "64.093781, -56.660923"
const beringStrait = "66.008666, -168.629891"
const response = await fetch(url);
const data = await response.json();
console.log(data);


const monthInput = document.getElementById('monthSelector');
const today = new Date();
const month = String(today.getMonth() + 1).padStart(2, '0');
monthInput.value = `1980-${month}`;
