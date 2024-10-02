const express = require('express');
const { body, validationResult } = require('express-validator');

require('dotenv').config();

const app = express();

const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME;

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));

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

app.post(
  '/submit',
  [
    body('name').notEmpty().withMessage('Name required').isLength({ min: 2 }).withMessage('Name must be greater or equal than 2 symbols'),
    body('email').isEmail().withMessage('Input correct email')
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg).join('. ');
      return res.redirect(`/3097_form_validation/?error=${encodeURIComponent(errorMessages)}&name=${req.body.name}&email=${req.body.email}`);
    }

    res.render('success', {
      name: req.body.name,
      email: req.body.email
    });
  }
);

app.listen(port, hostname, () => {
  console.log(`Server is running on port http://localhost:${port}`)
});