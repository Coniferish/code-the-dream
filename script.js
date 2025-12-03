const archiveUrl = "https://archive-api.open-meteo.com/v1/archive";
const davisStrait = "64.093781, -56.660923"
const beringStrait = "66.008666, -168.629891"

const monthInput = document.getElementById('monthSelector');
const today = new Date();
const month = String(today.getMonth() + 1).padStart(2, '0');
monthInput.value = `1980-${month}`;

let davisChart = null;
let beringChart = null;

async function fetchWeatherData(selectedDate, latLong, canvasId, chartInstance, locationName) {
    const [year, month] = selectedDate.split('-')
    const [lat, long] = latLong.split(', ')

    const startDate = `${year}-${month}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${month}-${lastDay}`;

    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${long}&start_date=${startDate}&end_date=${endDate}&hourly=temperature_2m,weather_code,cloud_cover,visibility,wind_speed_10m,rain,showers,snowfall&temporal_resolution=hourly_3`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (chartInstance) {
            chartInstance.destroy();
        }

        const ctx = document.getElementById(canvasId).getContext('2d');
        const newChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.hourly.time,
                datasets: [{
                    label: 'Temperature (°C)',
                    data: data.hourly.temperature_2m,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Temperature Trends - ${locationName}`
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
        console.log(data);
        return newChart;
    } catch (error) {
        console.error('Error fetching weather data: ', error)
    }
}

async function updateBothCharts(selectedDate) {
    davisChart = await fetchWeatherData(selectedDate, davisStrait, 'davisWeatherChart', davisChart, 'Davis Strait');
    beringChart = await fetchWeatherData(selectedDate, beringStrait, 'beringWeatherChart', beringChart, 'Bering Strait');
}

monthInput.addEventListener('change', (event) => {
    const selectedDate = event.target.value;
    updateBothCharts(selectedDate);
});

updateBothCharts(monthInput.value);


