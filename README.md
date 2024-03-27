# Node.js logger an viewer

This Node.js application serves as a logging tool and real-time data viewer. It logs JSON data to `public/json_log`, which is automatically created if it doesn't exist.

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

