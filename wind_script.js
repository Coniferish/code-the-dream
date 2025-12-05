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

async function fetchWindData(selectedYear, latLong, canvasId, chartInstance) {
    const [lat, long] = latLong.split(', ')

    const startDate = `${selectedYear}-${startMonth}-${startDay}`;
    const endDate = `${selectedYear}-${endMonth}-${endDay}`;

    const archiveUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${long}&start_date=${startDate}&end_date=${endDate}&hourly=wind_speed_10m&temporal_resolution=hourly_3`;
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=wind_speed_10m&forecast_days=16&past_days=92&temporal_resolution=hourly_3`

    try {
        const archiveResponse = await fetch(archiveUrl);
        const archiveData = await archiveResponse.json();
        
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();
        console.log(forecastData)

        if (chartInstance) {
            chartInstance.destroy();
        }

        const ctx = document.getElementById(canvasId).getContext('2d');

        const newChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: archiveData.hourly.time,
                datasets: [{
                    label: `${selectedYear} Wind Speed`,
                    data: archiveData.hourly.wind_speed_10m,
                    borderColor: 'rgba(101, 183, 255, 1)',
                    tension: 0.1
                },
                {
                    label: `${today.getFullYear()} Wind Speed`,
                    data: forecastData.hourly.wind_speed_10m,
                    borderColor: 'rgba(255, 134, 200, 1)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date'
                        },
                        ticks: {
                            callback: function(value) {
                                const date = new Date(this.getLabelForValue(value));
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                return `${month}/${day}`;
                            },
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Wind Speed (km/h)'
                        }
                    }
                }
            }
        });
        return newChart;
    } catch (error) {
        console.error('Error fetching weather data: ', error)
    }
}

async function updateBothCharts(selectedDate) {
    archiveDavisChart = await fetchWindData(selectedDate, davisCoordinates, 'davisWindChart', archiveDavisChart);
    archiveBeringChart = await fetchWindData(selectedDate, beringCoordinates, 'beringWindChart', archiveBeringChart);
}

yearInput.addEventListener('change', (event) => {
    const selectedDate = event.target.value;
    updateBothCharts(selectedDate);
});

updateBothCharts(yearInput.value);
