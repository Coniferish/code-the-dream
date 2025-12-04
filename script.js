const archiveUrl = "https://archive-api.open-meteo.com/v1/archive";
const davisCoordinates = "64.093781, -56.660923"
const beringCoordinates = "66.008666, -168.629891"

const yearInput = document.getElementById('yearSelector');
const today = new Date();

let startDate = new Date();
startDate.setDate(startDate.getDate() - 92);
let endDate = new Date();
endDate.setDate(endDate.getDate() + 15);

const startMonth = String(startDate.getMonth() + 1).padStart(2, '0');
const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');

const startDay = String(startDate.getDate()).padStart(2, '0');
const endDay = String(endDate.getDate()).padStart(2, '0');

yearInput.value = `1980`;

let archiveDavisChart = null;
let archiveBeringChart = null;
let forcastDavisChart = null;
let forecastBeringChart = null;

async function fetchWeatherData(selectedYear, latLong, canvasId, chartInstance) {
    const [lat, long] = latLong.split(', ')

    const startDate = `${selectedYear}-${startMonth}-${startDay}`;
    const endDate = `${selectedYear}-${endMonth}-${endDay}`;

    const archiveUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${long}&start_date=${startDate}&end_date=${endDate}&hourly=temperature_2m,weather_code,cloud_cover,visibility,wind_speed_10m,rain,showers,snowfall&temporal_resolution=hourly_3`;
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m,weather_code,cloud_cover,visibility,wind_speed_10m,rain,showers,snowfall&forecast_days=16&past_days=92&temporal_resolution=hourly_3`

    try {
        const archiveResponse = await fetch(archiveUrl);
        const archiveData = await archiveResponse.json();
        
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        if (chartInstance) {
            chartInstance.destroy();
        }

        const ctx = document.getElementById(canvasId).getContext('2d');

        const newChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: archiveData.hourly.time,
                datasets: [{
                    label: 'Archive Temperature (°C)',
                    data: archiveData.hourly.temperature_2m,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                },
                {
                    label: 'Forecast Temperature (°C)',
                    data: forecastData.hourly.temperature_2m,
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Temperature Trends`
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Temperature (°C)'
                        }
                    }
                }
            }
        });
        console.log(archiveData);
        return newChart;
    } catch (error) {
        console.error('Error fetching weather data: ', error)
    }
}

async function updateBothCharts(selectedDate) {
    archiveDavisChart = await fetchWeatherData(selectedDate, davisCoordinates, 'davisWeatherChart', archiveDavisChart);
    archiveBeringChart = await fetchWeatherData(selectedDate, beringCoordinates, 'beringWeatherChart', archiveBeringChart);
}

yearInput.addEventListener('change', (event) => {
    const selectedDate = event.target.value;
    updateBothCharts(selectedDate);
});

updateBothCharts(yearInput.value);


