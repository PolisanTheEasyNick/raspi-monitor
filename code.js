var Gauge = window.Gauge;

var cpuUsageGauge = Gauge(document.getElementById("cpuUsageGauge"), {
  max: 100,
  // custom label renderer
  label: function(value) {
    return Math.round(value) + "%";
  },
  value: 50,
  // Custom dial colors (Optional)
  color: function(value) {
    if(value < 80) {
      return "var(--good)"; // green
    }else if(value >= 80 && value < 90) {
      return "var(--warning)"; // yellow
    }else if(value >= 90) {
      return "var(--bad)"; // red
    }
  },
  dialStartAngle: 160,
  dialEndAngle: 20,
});

var gpuUsageGauge = Gauge(document.getElementById("gpuUsageGauge"), {
  max: 100,
  // custom label renderer
  label: function(value) {
    return Math.round(value) + "%";
  },
  value: 50,
  // Custom dial colors (Optional)
  color: function(value) {
    if(value < 80) {
      return "var(--good)"; // green
    }else if(value >= 80 && value < 90) {
      return "var(--warning)"; // yellow
    }else if(value >= 90) {
      return "var(--bad)"; // red
    }
  },
  dialStartAngle: 160,
  dialEndAngle: 20,
});

var ramUsageGauge = Gauge(document.getElementById("ramUsageGauge"), {
  max: 100,
  // custom label renderer
  label: function(value) {
    return Math.round(value) + "%";
  },
  value: 50,
  // Custom dial colors (Optional)
  color: function(value) {
    if(value < 80) {
      return "var(--good)"; // green
    }else if(value >= 80 && value < 90) {
      return "var(--warning)"; // yellow
    }else if(value >= 90) {
      return "var(--bad)"; // red
    }
  },
  dialStartAngle: 160,
  dialEndAngle: 20,
});

var cpuTempGauge = Gauge(document.getElementById("cpuTempGauge"), {
  max: 100,
  // custom label renderer
  label: function(value) {
    return Math.round(value) + "°C";
  },
  value: 50,
  // Custom dial colors (Optional)
  color: function(value) {
    if(value < 65) {
      return "var(--good)"; // green
    }else if(value >= 65 && value < 75) {
      return "var(--warning)"; // yellow
    }else if(value >= 75) {
      return "var(--bad)"; // red
    }
  },
  dialStartAngle: 160,
  dialEndAngle: 20,
});

var gpuTempGauge = Gauge(document.getElementById("gpuTempGauge"), {
  max: 100,
  // custom label renderer
  label: function(value) {
    return Math.round(value) + "°C";
  },
  value: 50,
  // Custom dial colors (Optional)
  color: function(value) {
    if(value < 65) {
      return "var(--good)"; // green
    }else if(value >= 65 && value < 75) {
      return "var(--warning)"; // yellow
    }else if(value >= 75) {
      return "var(--bad)"; // red
    }
  },
  dialStartAngle: 160,
  dialEndAngle: 20,
});

const promPC = new Prometheus.PrometheusDriver({
  endpoint: prometheusPCEndpoint,
});

const promRPI = new Prometheus.PrometheusDriver({
  endpoint: prometheusRPIEndpoint,
})

var MemTotal;
promPC.instantQuery('node_memory_MemTotal_bytes')
  .then((res) => {
    MemTotal = res['result'][0]['value']['value']
  })


function setGaugeValue(gauge, value, elementID, goodValue, warningValue) {
  gauge.setValueAnimated(value, 0.5)
  element = document.getElementById(elementID).children["1"].children[1].children[0]
  if (value < goodValue) {
    element.style.fill = "var(--good)";
  } else if (value >= goodValue && value < warningValue) {
    element.style.fill = "var(--warning)";
  } else if(value >= warningValue) {
    element.style.fill = "var(--bad)";
  }

}

const updateGaugeValue = () => {
  promPC.instantQuery('{__name__=~"aida_sys_scpuuti|aida_sys_sgpuuti|nvidia_smi_utilization_gpu_ratio|aida_sys_memuti|node_memory_MemAvailable_bytes|aida_temp|aida_temp_tgpu|nvidia_smi_temperature_gpu|aida_sys_suptime_total|node_boot_time_seconds"}')
    .then((res) => {
      for(const metric of res.result) {
        switch(metric["metric"]["name"]) {
          case 'aida_sys_memuti':
            setGaugeValue(ramUsageGauge, metric["value"]["value"], "ramUsageGauge", 80, 90)
            break
          case 'aida_sys_scpuuti':
            setGaugeValue(cpuUsageGauge, metric["value"]["value"], "cpuUsageGauge", 80, 90)
            break
          case 'nvidia_smi_utilization_gpu_ratio':
            metric["value"]["value"] *= 100;
          case 'aida_sys_sgpuuti':
            setGaugeValue(gpuUsageGauge, metric["value"]["value"], "gpuUsageGauge", 80, 90)
            break
          case 'aida_sys_srtssfps':
            document.getElementById("fps").textContent = metric["value"]["value"];
            if(metric["value"]["value"] == 0) {
              document.getElementById("fps").style.color = 'white'
            } else if(metric["value"]["value"] > 0 && metric["value"]["value"] < 30) {
              document.getElementById("fps").style.color = 'var(--bad)'
            } else if(metric["value"]["value"] >= 30 && metric["value"]["value"] < 50) {
              document.getElementById("fps").style.color = 'var(--warning)'
            } else {
              document.getElementById("fps").style.color = 'var(--good)'
            }
            break
          case 'aida_sys_suptime_total':
            const date = new Date(null);
            date.setSeconds(metric["value"]["value"]);
            const result = date.toISOString().slice(11, 19);
            document.getElementById("uptime").textContent = result
            break
          case 'aida_temp':
            setGaugeValue(cpuTempGauge, metric["value"]["value"], "cpuTempGauge", 65, 75)
            break
          case 'aida_temp_tgpu':
          case 'nvidia_smi_temperature_gpu':
            setGaugeValue(gpuTempGauge, metric["value"]["value"], "gpuTempGauge", 65, 75)
            break
          case 'node_boot_time_seconds':
            const date2 = new Date();
            date2.setSeconds(new Date().getTime() / 1000 - metric["value"]["value"] / 1000);
            const result2 = date2.toISOString().slice(11, 19);
            document.getElementById("uptime").textContent = result2
            break
          case 'node_memory_MemAvailable_bytes':
            const memUsage = (1 - (metric["value"]["value"] / (MemTotal)))* 100
            ramUsageGauge.setValueAnimated(memUsage, 0.5)
            element = document.getElementById("ramUsageGauge").children["1"].children[1].children[0]
            if (memUsage < 80) {
              element.style.fill = "var(--good)";
            } else if (memUsage >= 80 && memUsage < 90) {
              element.style.fill = "var(--warning)";
            } else if(memUsage >= 90) {
              element.style.fill = "var(--bad)";
            }
            break

          default:
            console.log(metric["metric"]["name"]) 
        }
      }
    })
    .catch((err) => {
      console.error('Error fetching Prometheus data: ' + err);
    });

    //cpu utilization
    promPC.instantQuery("100 - (avg(irate(node_cpu_seconds_total{mode='idle'}[1m])) * 100)")
    .then((res) => {
      setGaugeValue(cpuUsageGauge, res['result'][0]['value']['value'], "cpuUsageGauge", 80, 90)
    })
    promPC.instantQuery(`node_hwmon_temp_celsius{sensor='${tempSensor}'}`)
    .then((res) => {
      setGaugeValue(cpuTempGauge, res['result'][0]['value']['value'], "cpuTempGauge", 65, 75)
    })
};

const updateRpiValue = () => {
  promRPI.instantQuery("rpi_cpu_temperature_celsius")
    .then((res) => {
      document.getElementById("rpi-temp").textContent = Math.round(res.result[0]["value"]["value"] * 10) / 10
      if(res.result[0]["value"]["value"] > 0 && res.result[0]["value"]["value"] < 65) {
        document.getElementById("rpi-temp").style.color = 'var(--good)'
      } else if(res.result[0]["value"]["value"] >= 65 && res.result[0]["value"]["value"] < 75) {
        document.getElementById("rpi-temp").style.color = 'var(--warning)'
      } else {
        document.getElementById("rpi-temp").style.color = 'var(--bad)'
      }
    })
    .catch((err) => {
      console.error('Error fetching Prometheus data:' + err);
    });
}
// Set up an interval to call the update function every second
const queryInterval1 = setInterval(updateGaugeValue, 1000);
const queryInterval2 = setInterval(updateRpiValue, 1000);

//WEATHER
async function getWeatherWS() {
    let socket;

    async function connectWebSocket() {
        socket = new WebSocket(websocketWeatherServer);

        socket.addEventListener('open', () => {
            console.log('WebSocket connected');
        });

        socket.addEventListener('message', async function (event) {
            try {
                const weatherData = JSON.parse(event.data);

                // Update the UI with new weather data
                const temperature = Math.round(weatherData.temperature_celsius);
                const description = weatherData.weather_text;
                const weatherIcon = weatherData.weather_icon_id;

                document.querySelector('.temp-number').textContent = temperature;
                document.querySelector('.description').textContent = description;
                document.getElementById('uvi').textContent = weatherData.uv_index;

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

    // Initial connection attempt
    await connectWebSocket();
}
getWeatherWS()
