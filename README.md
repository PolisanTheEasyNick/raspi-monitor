# raspi-monitor
Web page for monitoring your PC using a Raspberry Pi with a display of 480x320


1) You need Prometheus installed on your PC with [AIDA64 Exporter](https://gist.github.com/wolph/558158dd92ce08cb2253c07934a12ad8)
2) You need Prometheus installed on RPi with [rpi_exporter](https://github.com/lukasmalkmus/rpi_exporter) and node_exporter.
3) For weather support, you need to get an API key from [AccuWeather](https://developer.accuweather.com/) and [WeatherAPI](https://www.weatherapi.com/) (probably optional; I use it to get whether currently day or night for auto-enabling/disabling RPi display.)
4) Check the code.js file and set up server links. For weather, check addons/weather.py for a weather server example.


