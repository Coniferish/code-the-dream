const archiveUrl = "https://archive-api.open-meteo.com/v1/archive";
const davisCoordinates = "64.093781, -56.660923"
const beringCoordinates = "66.008666, -168.629891"

const yearInput = document.getElementById('yearSelector');
const today = new Date();
const month = String(today.getMonth() + 1).padStart(2, '0');
yearInput.value = '1980';

let archiveDavisChart = null;
let archiveBeringChart = null;

async function fetchArchiveData(selectedYear, latLong, canvasId, chartInstance) {
    const [lat, long] = latLong.split(', ')

    const startDate = `${selectedYear}-${month}-01`;
    const lastDay = new Date(selectedYear, month, 0).getDate();
    const endDate = `${selectedYear}-${month}-${lastDay}`;

    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${long}&start_date=${startDate}&end_date=${endDate}&hourly=temperature_2m,weather_code,cloud_cover,visibility,wind_speed_10m,rain,showers,snowfall&temporal_resolution=hourly_3`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (chartInstance) {
            chartInstance.destroy();
        }

        const ctx = document.getElementById(canvasId).getContext('2d');

        // Create labels array showing only 12:00 for each day
        const displayLabels = data.hourly.time.map(time => {
            return time.includes('T12:00') ? time : '';
        });

        const newChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: displayLabels,
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
        console.log(data);
        return newChart;
    } catch (error) {
        console.error('Error fetching weather data: ', error)
    }
}

async function updateBothCharts(selectedDate) {
    archiveDavisChart = await fetchArchiveData(selectedDate, davisCoordinates, 'davisWeatherChart', archiveDavisChart);
    archiveBeringChart = await fetchArchiveData(selectedDate, beringCoordinates, 'beringWeatherChart', archiveBeringChart);
}

yearInput.addEventListener('change', (event) => {
    const selectedDate = event.target.value;
    updateBothCharts(selectedDate);
});

updateBothCharts(yearInput.value);


