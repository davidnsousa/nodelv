# Node.js logger an viewer

Node.js application to log and view real-time data on a local or remote server. The app logs JSON data to `public/json_log`, which is automatically created if it doesn't exist.

Useful for citizen science projects (or other purposes) that require sensor data logging for monitoring real-time measures of temperature, humidity, air quality, etc.

## Usage example

Before running the application, you need to set the API key:

```bash
echo some_api_key > api_key
```

Onde the API key is set run the `app.js` by specifying the port and path as command-line arguments:

```bash
port=3000
path='/weather'
node app.js $port $path
```

To test the logger, execute the following script (replace `some_api_key` with the API key you set). It simulates data generation for temperature and humidity using cURL:

```bash
while true; do
    temperature=$(shuf -i 25-30 -n 1)
    humidity=$(shuf -i 85-100 -n 1)
    curl -X POST \
        -H "Content-Type: application/json" \
        -H "x-api-key: some_api_key" \
        -d '{"Temperature (ºC)": '"$temperature"', "Humidity (%)": '"$humidity"'}' \
        http://localhost:3000/weather/log
    sleep 0.01
done
```
Once the logger is running, navigate to `localhost:3000/weather` in your web browser to view the live data.

## Go beyond

The log file and the most recent log entry are available at `http://localhost:3000/weather/json_log` and `http://localhost:3000/weather/json_data` respectively. This is useful for scripting data vizualization. 

### Examples

1. Get the most recent log entry in bash using `jq`:

```bash
curl -s http://localhost:3000/weather/json_data | jq .
```
Output:

```bash
{
  "Temperature (ºC)": 28,
  "Humidity (%)": 89,
  "timestamp": 1711519862475
}
```

2. Get the  log data (5 lines) with python using `requests` and `tabulate`:

```python
import json
import requests
from tabulate import tabulate

response = requests.get("http://localhost:3000/weather/json_log")
if response.status_code == 200:
    data = [json.loads(line) for line in response.text.splitlines()[-5:]]
    if data:
        keys = list(data[0].keys())
        table = []
        for entry in data:
            table.append([entry[key] for key in keys])
        print(tabulate(table, headers=keys, tablefmt="grid"))
```
Output:

```
+--------------------+----------------+---------------+
|   Temperature (ºC) |   Humidity (%) |     timestamp |
+====================+================+===============+
|                 28 |             90 | 1711519860687 |
+--------------------+----------------+---------------+
|                 30 |             83 | 1711519861147 |
+--------------------+----------------+---------------+
|                 25 |             90 | 1711519861604 |
+--------------------+----------------+---------------+
|                 27 |             83 | 1711519861974 |
+--------------------+----------------+---------------+
|                 28 |             89 | 1711519862475 |
+--------------------+----------------+---------------+
```
