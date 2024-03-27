express = require('express');
bodyParser = require('body-parser');
fs = require('fs');
path = require('path')
app = express();

port = process.argv[2];
location = process.argv[3];
api_key = fs.readFileSync(__dirname + '/api_key', 'utf8').split('\n')[0];
publicFolderPath = path.join(__dirname, 'public');
logFilePath = publicFolderPath + '/json_log';

if (fs.existsSync(logFilePath)) {
    lines = fs.readFileSync(logFilePath, 'utf8').split('\n');
    lastLine = lines[lines.length - 2];
    data = JSON.parse(lastLine);
} else {
    data = {'State':'Waiting for data...'};
}

if (!fs.existsSync(publicFolderPath)) {
    fs.mkdirSync(publicFolderPath);
}

app.use(location, express.static(publicFolderPath))

app.use(bodyParser.json());

app.post(location + '/log', validateAPIKey, (req, res) => {
  data = req.body;
  data.timestamp = Date.now();
  stringifiedData = JSON.stringify(data) + '\n';
	  
  fs.appendFile(logFilePath, stringifiedData, (err) => {
    if (err) {
      console.error('Error logging data:', err);
      res.status(500).send('Error logging data');
    } else {
      console.log('Data logged successfully');
      res.send('Data logged successfully');
    }
  });
});

app.get(location + '/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get(location + '/json_data', (req, res) => {
    res.json(data);
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}${location}`);
});

function validateAPIKey(req, res, next) {
  if (req.headers['x-api-key'] !== api_key) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}
