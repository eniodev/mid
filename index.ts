const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mid = require('./mid');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const namingRule = () => {
    return Date.now() + '-' + Math.round(Math.random() * 1E9);
}

const middle = mid({ saveTo: 'uploads', namingRule });

app.post('/', middle, async (req, res) => {
    res.json(typeof req.file);
    console.log(req.file);
})

const port = process.env.PORT || 3000;

app.listen(port, async () => {
    console.log('UP!');
})