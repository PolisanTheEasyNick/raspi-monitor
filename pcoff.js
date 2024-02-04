function formatTime(seconds) {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
  
    const formattedTime =
      (days > 0 ? days + "d " : "") +
      (hours < 10 ? "0" : "") +
      hours +
      ":" +
      (minutes < 10 ? "0" : "") +
      minutes +
      ":" +
      (remainingSeconds < 10 ? "0" : "") +
      remainingSeconds;
  
    return formattedTime;
  }

async function getWeatherWS() {
    let socket;

    async function connectWebSocket() {
        socket = new WebSocket(websocketWeatherServer);

        socket.addEventListener('open', () => {
            console.log('WebSocket connected');
        });

        socket.addEventListener('message', async function (event) {
            try {
                console.log('Got event: ', event);
                console.log('event.data: ', event.data);

                const weatherData = JSON.parse(event.data);

                const temperature = Math.round(weatherData.temperature_celsius);
                const weatherIcon = weatherData.weather_icon_id;
                const uv_index = weatherData.uv_index
                const weatherDescription = weatherData.weather_text;
                document.querySelector('.temp-number').textContent = temperature;
                document.querySelector('.weather-description').textContent = weatherDescription;
                document.querySelector('.temp-number').textContent = temperature;
                document.querySelector('.uv-number').textContent = uv_index;

                const svgResponse = await fetch(weatherIconFolderLink + weatherIcon + '.svg');
                const svgText = await svgResponse.text();

                const svgContainer = document.querySelector('.weather-icon');
                svgContainer.innerHTML = svgText;
            } catch (error) {
                console.error('Error parsing WebSocket data', error);
            }
        });

        socket.addEventListener('close', (event) => {
            console.error('WebSocket closed. Reconnecting in 10 seconds...');
            setTimeout(connectWebSocket, 10000); // Reconnect after 10 seconds
        });
    }
    await connectWebSocket();
}
getWeatherWS()

function updateDateTime() {
    const currentDate = new Date();

    // Format date as "DD Month YYYY"
    const optionsDate = { day: '2-digit', month: 'long', year: 'numeric' };
    const formattedDate = currentDate.toLocaleDateString('en-US', optionsDate);

    // Format time as "HH:mm:ss"
    const optionsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const formattedTime = currentDate.toLocaleTimeString('en-US', optionsTime);

    // Update elements with the formatted date and time
    document.getElementById('date').textContent = formattedDate;
    document.getElementById('time').textContent = formattedTime;
  }

  // Update date and time every second
  setInterval(updateDateTime, 1000);

  // Initial update when the page loads
  updateDateTime();

const promRPI = new Prometheus.PrometheusDriver({
    endpoint: prometheusRPIEndpoint,
  })

  const updateRpiValue = () => {
    promRPI.instantQuery('{__name__=~"rpi_cpu_temperature_celsius|node_boot_time_seconds"}')
      .then((res) => {
        for(const metric of res.result) {
            switch(metric["metric"]["name"]) {
                case 'rpi_cpu_temperature_celsius': 
                    document.getElementById("rpi-temp").textContent = Math.round(metric["value"]["value"] * 10) / 10 + "°"
                    if(metric["value"]["value"] > 0 && metric["value"]["value"] < 65) {
                      document.getElementById("rpi-temp").style.color = 'var(--good)'
                    } else if(metric["value"]["value"] >= 65 && metric["value"]["value"] < 75) {
                      document.getElementById("rpi-temp").style.color = 'var(--warning)'
                    } else {
                      document.getElementById("rpi-temp").style.color = 'var(--bad)'
                    }
                    break
                case 'node_boot_time_seconds':
                    document.getElementById("uptime").textContent = formatTime(Math.floor(new Date().getTime() / 1000) - metric["value"]["value"])
                    break
                
            }
        }
      })
      .catch((err) => {
        console.error('Error fetching Prometheus data:' + err);
      });
  }

  const queryInterval = setInterval(updateRpiValue, 1000);
