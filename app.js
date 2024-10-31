const express = require('express');
const { body, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

const app = express();

const port = process.env.PORT || 3001;
const hostname = process.env.HOSTNAME;
const filePath = path.join(__dirname, 'db.json');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

// Main page
app.get('/', (req, res) => {
  const error = req.query.error ? decodeURIComponent(req.query.error) : null;
  const name = req.query.name || '';
  const email = req.query.email || '';

  res.render('form', {
    error,
    name,
    email
  });
});


const validationOptions = [
  body('name').notEmpty().withMessage('Name required').isLength({ min: 2 }).withMessage('Name must be greater or equal than 2 symbols'),
  body('email').isEmail().withMessage('Input correct email')
];

// Action 
app.post('/submit', validationOptions, (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg).join('. ');
      return res.redirect(`/?error=${encodeURIComponent(errorMessages)}&name=${req.body.name}&email=${req.body.email}`);
    }

    addDataToFile({
      name: req.body.name,
      email: req.body.email
    });

    return res.redirect('/success');
});

// Result 
app.get('/success', (req, res) => {

  if (!fs.existsSync(filePath)) {
    res.render('success', {data: []});
  }
  
  const data = fs.readFileSync(filePath);

  let parsedData;
  
  try {
    parsedData = JSON.parse(data);
  } catch (err) {
    parsedData = [];
  }

  if (!Array.isArray(parsedData)) {
    parsedData = [parsedData];
  }
  
  res.render('success', {data: parsedData});
});

// Helpers
function addDataToFile(newData) {
  let data = [];

  if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf-8');
    data = JSON.parse(fileData);
  }

  data.push(newData);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Listen
app.listen(port, hostname, () => {
  console.log(`Server is running on port http://localhost:${port}`)
});