#!/usr/bin/python3
import requests
import json
import datetime
import pytz
from time import sleep
import asyncio
import websockets

#replace with your AccuWeather API key
api_key = ''
weatherapi_api_key = ''
#replace with the location key for your desired location
location_key = '000000'
weatherapi_location = '00.00000,00.00000' #lat, lon

#change to your timezone
timezone = 'Europe/Kiev'

url = f'http://dataservice.accuweather.com/currentconditions/v1/{location_key}?apikey={api_key}&details=true'

wss = set()
last_weather = {}

async def send_update(data): #data
    global wss
    connected_clients = set()
    for ws in wss:
      try:
        message = json.dumps(data)
        await ws.send(message)
        connected_clients.add(ws)
      except (websockets.exceptions.ConnectionClosedOK, websockets.exceptions.ConnectionClosedError):
        pass #some client disconnected, will be removed
    wss = connected_clients

async def weather_update():
	global last_weather
	while True:
	  #send a GET request to the API endpoint and parse the JSON response
	  response = requests.get(url)
	  try:
	    weather_data = json.loads(response.content)[0]
	  except:
	    print(f"Cant get [0], response.content: {response.content}")
	    asyncio.sleep(1800)
	    continue
	
      #for developer purposes below are example response from accuweather
      #created because of limit per day
      #if you are adding new features, just comment code upper and uncomment below
	  #weather_data = json.loads('[{"LocalObservationDateTime":"2023-05-05T13:47:00+03:00","EpochTime":1683283620,"WeatherText":"Partly sunny","WeatherIcon":3,"HasPrecipitation":false,"PrecipitationType":null,"IsDayTime":true,"Temperature":{"Metric":{"Value":15.5,"Unit":"C","UnitType":17},"Imperial":{"Value":60,"Unit":"F","UnitType":18}},"RealFeelTemperature":{"Metric":{"Value":19.1,"Unit":"C","UnitType":17,"Phrase":"Pleasant"},"Imperial":{"Value":66,"Unit":"F","UnitType":18,"Phrase":"Pleasant"}},"RealFeelTemperatureShade":{"Metric":{"Value":14,"Unit":"C","UnitType":17,"Phrase":"Cool"},"Imperial":{"Value":57,"Unit":"F","UnitType":18,"Phrase":"Cool"}},"RelativeHumidity":66,"IndoorRelativeHumidity":49,"DewPoint":{"Metric":{"Value":9.1,"Unit":"C","UnitType":17},"Imperial":{"Value":48,"Unit":"F","UnitType":18}},"Wind":{"Direction":{"Degrees":0,"Localized":"N","English":"N"},"Speed":{"Metric":{"Value":12.6,"Unit":"km/h","UnitType":7},"Imperial":{"Value":7.8,"Unit":"mi/h","UnitType":9}}},"WindGust":{"Speed":{"Metric":{"Value":17.3,"Unit":"km/h","UnitType":7},"Imperial":{"Value":10.7,"Unit":"mi/h","UnitType":9}}},"UVIndex":6,"UVIndexText":"High","Visibility":{"Metric":{"Value":16.1,"Unit":"km","UnitType":6},"Imperial":{"Value":10,"Unit":"mi","UnitType":2}},"ObstructionsToVisibility":"","CloudCover":50,"Ceiling":{"Metric":{"Value":11582,"Unit":"m","UnitType":5},"Imperial":{"Value":38000,"Unit":"ft","UnitType":0}},"Pressure":{"Metric":{"Value":1022.3,"Unit":"mb","UnitType":14},"Imperial":{"Value":30.19,"Unit":"inHg","UnitType":12}},"PressureTendency":{"LocalizedText":"Steady","Code":"S"},"Past24HourTemperatureDeparture":{"Metric":{"Value":-0.3,"Unit":"C","UnitType":17},"Imperial":{"Value":-1,"Unit":"F","UnitType":18}},"ApparentTemperature":{"Metric":{"Value":18.3,"Unit":"C","UnitType":17},"Imperial":{"Value":65,"Unit":"F","UnitType":18}},"WindChillTemperature":{"Metric":{"Value":15.6,"Unit":"C","UnitType":17},"Imperial":{"Value":60,"Unit":"F","UnitType":18}},"WetBulbTemperature":{"Metric":{"Value":12.1,"Unit":"C","UnitType":17},"Imperial":{"Value":54,"Unit":"F","UnitType":18}},"Precip1hr":{"Metric":{"Value":0,"Unit":"mm","UnitType":3},"Imperial":{"Value":0,"Unit":"in","UnitType":1}},"PrecipitationSummary":{"Precipitation":{"Metric":{"Value":0,"Unit":"mm","UnitType":3},"Imperial":{"Value":0,"Unit":"in","UnitType":1}},"PastHour":{"Metric":{"Value":0,"Unit":"mm","UnitType":3},"Imperial":{"Value":0,"Unit":"in","UnitType":1}},"Past3Hours":{"Metric":{"Value":0,"Unit":"mm","UnitType":3},"Imperial":{"Value":0,"Unit":"in","UnitType":1}},"Past6Hours":{"Metric":{"Value":0,"Unit":"mm","UnitType":3},"Imperial":{"Value":0,"Unit":"in","UnitType":1}},"Past9Hours":{"Metric":{"Value":0,"Unit":"mm","UnitType":3},"Imperial":{"Value":0,"Unit":"in","UnitType":1}},"Past12Hours":{"Metric":{"Value":0,"Unit":"mm","UnitType":3},"Imperial":{"Value":0,"Unit":"in","UnitType":1}},"Past18Hours":{"Metric":{"Value":0.2,"Unit":"mm","UnitType":3},"Imperial":{"Value":0.01,"Unit":"in","UnitType":1}},"Past24Hours":{"Metric":{"Value":1,"Unit":"mm","UnitType":3},"Imperial":{"Value":0.04,"Unit":"in","UnitType":1}}},"TemperatureSummary":{"Past6HourRange":{"Minimum":{"Metric":{"Value":9,"Unit":"C","UnitType":17},"Imperial":{"Value":48,"Unit":"F","UnitType":18}},"Maximum":{"Metric":{"Value":15.5,"Unit":"C","UnitType":17},"Imperial":{"Value":60,"Unit":"F","UnitType":18}}},"Past12HourRange":{"Minimum":{"Metric":{"Value":9,"Unit":"C","UnitType":17},"Imperial":{"Value":48,"Unit":"F","UnitType":18}},"Maximum":{"Metric":{"Value":15.5,"Unit":"C","UnitType":17},"Imperial":{"Value":60,"Unit":"F","UnitType":18}}},"Past24HourRange":{"Minimum":{"Metric":{"Value":9,"Unit":"C","UnitType":17},"Imperial":{"Value":48,"Unit":"F","UnitType":18}},"Maximum":{"Metric":{"Value":17.3,"Unit":"C","UnitType":17},"Imperial":{"Value":63,"Unit":"F","UnitType":18}}}},"MobileLink":"http://www.accuweather.com/en/ua/chernivtsi/322253/current-weather/322253?lang=en-us","Link":"http://www.accuweather.com/en/ua/chernivtsi/322253/current-weather/322253?lang=en-us"}]')[0]
	
	  #extract the temperature in Celsius and the weather icon ID from the response
	  temp = weather_data['Temperature']['Metric']['Value']
	  weather_icon = weather_data['WeatherIcon']
	  weather_text = weather_data['WeatherText']
	  uv_index = weather_data['UVIndex']
	  real_temp = weather_data['RealFeelTemperature']['Metric']['Value']
	
      
	  response = requests.get(f"http://api.weatherapi.com/v1/astronomy.json?key={weatherapi_api_key}&q={weatherapi_location}")
	  sunrise_data = json.loads(response.content)
	  sunrise = sunrise_data['astronomy']['astro']['sunrise']
	  sunset = sunrise_data['astronomy']['astro']['sunset']
	  # Parse the target time string into a datetime.time object
	  sunrise_time = datetime.datetime.strptime(sunrise, '%I:%M %p').time()
	  sunset_time = datetime.datetime.strptime(sunset, '%I:%M %p').time()

	  tz = pytz.timezone(timezone)
	  current_time = datetime.datetime.now(tz).time()
	  isDay = False
	  if current_time >= sunrise_time and current_time <= sunset_time:
	    isDay = True
	  else:
	    isDay = False
	
	  print(f"Current temp: {temp}")
	  print(f"Real temp: {real_temp}")
	  print(f"Weather text: {weather_text}")
	  print(f"Weather icon id: {weather_icon}")
	  print(f"Sunrise time: {sunrise}")
	  print(f"UV Index: {uv_index}")
	  print(f"Is day in Ukraine: {isDay}")
	  print(f"Update time: {datetime.datetime.now(tz).strftime('%Y-%m-%d %H:%M:%S')}")
	
	  # Create a dictionary with the weather data
	  weather_dict = {
	    'temperature_celsius': temp,
	    'real_temp_celsius': real_temp,
	    'weather_icon_id':  weather_icon,
	    'is_day': isDay,
	    'weather_text': weather_text,
	    'uv_index': uv_index,
	    'last_update_time': datetime.datetime.now(tz).strftime('%Y-%m-%d %H:%M:%S'),
	  }
	
	  # Write the weather data as JSON to a file named "weather_data.json"
	  with open('weather_data.json', 'w') as f:
		  json.dump(weather_dict, f)
	  await send_update(weather_dict)
	  last_weather = weather_dict
	  await asyncio.sleep(1800) #sleep 30 mins #1800 was

async def websocket_server(websocket, path):
    print(f"Connected client {websocket} on path {path}")
    global wss
    global last_weather
    wss.add(websocket)
    try:
        await websocket.send(json.dumps(last_weather))
        while True:
            await asyncio.sleep(1)
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        wss.remove(websocket)

if __name__ == "__main__":
    # Start the WebSocket server
    start_server = websockets.serve(websocket_server, port=8765)

    # Start the weather update loop
    loop = asyncio.get_event_loop()
    loop.create_task(weather_update())

    # Start the event loop
    loop.run_until_complete(start_server)
    loop.run_forever()
