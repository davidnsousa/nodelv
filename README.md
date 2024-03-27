# Node.js data logger an viewer

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
Once the logger is running, navigate to `http://localhost:3000/weather` in your web browser to view the live data.

![alt text](https://i.imgur.com/0hfAyvI.png)

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

2. Get the  log data (last 5 lines) with python using `requests` and `tabulate` and plot it with `termplotlib` (or any other fancy  alternatives):

```python
import json
import requests
from tabulate import tabulate
import termplotlib as tpl
import datetime

# Get json_log
response = requests.get("http://localhost:3000/weather/json_log")
data = [json.loads(line) for line in response.text.splitlines()[-5:]]

# Create table
keys = list(data[0].keys())
table = []
for entry in data:
		table.append([entry[key] for key in keys])
print(tabulate(table, headers=keys, tablefmt="grid"))

# Plot data
for k in keys[0:-1]:
	t = [entry["timestamp"] - 1711519860000  for entry in data]
	x = [entry[k] for entry in data]
	fig = tpl.figure()
	fig.plot(t, x, xlabel="time (ms)", label=k, width=58, height=16)
	fig.show()

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
  30 +------------------------------------------------+
     |        ***  *                                  |
  29 |      **      *        Temperature (ºC) ******* |
     |   ***         *                                |
  28 | **             *                          ***  |
     |                 *                     ****     |
     |                  **               ****         |
  27 |                    *           ***             |
     |                     *        **                |
  26 |                      *     **                  |
     |                       *  **                    |
  25 +------------------------------------------------+
    600  800  1000 1200 1400 160 1800 2000 2200 2400 2600
                         time (ms)
  90 +------------------------------------------------+
     |  *                    * *                      |
  89 |   *                  *   *Humidity (%) ******* |
  88 |    *                *    *                **   |
     |     *              *      *              *     |
  87 |      *           **        *            *      |
  86 |       *         *           *         **       |
     |        *       *             *       *         |
  85 |         *     *               *     *          |
  84 |          *   *                *   **           |
     |           * *                  * *             |
  83 +------------------------------------------------+
    600  800  1000 1200 1400 160 1800 2000 2200 2400 2600
                         time (ms)


```
