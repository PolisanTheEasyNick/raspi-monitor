const websocketWeatherServer = 'ws://somesite:8765'
const weatherIconFolderLink = 'https://somesite/weatherIcons/' //link to where get icons for weather. icon = link+{weatherType}.svg
const prometheusPCEndpoint = 'http://192.168.0.4:9090'
const prometheusRPIEndpoint = 'http://192.168.0.2:9090'
const tempSensor = 'temp13' //find in prometheus using node_hwmon_temp_celsius expression

