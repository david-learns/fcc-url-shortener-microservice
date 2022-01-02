'use strict';
/**
 * 
 * 
 * david-learned:
 * 1) detailed server logs help pinpoint problems faster than anything
 * 2) reading the documentation may not help (unusual for documentation),
 *    ex: nodejs dns.lookup() docs **do not** outline proper format of href
 * 3) error messages are sometimes cryptic and unhelpful
 * 3) scouring the internet may eventually help
 * 4) don't give up :)
 * 
 * For the URL Shortener Microservice project on freeCodeCamp you do not need
 * to use dns.lookup() to pass the tests. The hint to use dns.lookup() ruins
 * the definition of the word. If you do use dns.lookup(), the protocol and
 * anything following the top-level domain need to be stripped off in order for
 * the lookup to function as expected. This very small detail caused much
 * delay and many a profanity.
 * 
 */
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
app.locals.map = new Map();
app.locals.key = 1;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.post('/api/shorturl', function (req, res) {

  console.log('POST ' + req.body.url);

  if (!req.body.url.match(/^https?:\/\/|^ftp:\/\//)) {

    console.log('error: url did not have expected protocol: http:// https:// ftp://');

    res.json({ error: 'Invalid URL' });

  } else {

    const index = req.body.url.indexOf('/', 8);
    const lookup = req.body.url.slice(0, index).replace(/^https?:\/\/|^ftp:\/\//, '');
    dns.lookup(lookup, (err) => {
      if (err) {

        console.log('dns lookup failed, err: ' + err.message);

        res.json({ error: 'Invalid URL' });
      } else {
        app.locals.map.set(app.locals.key, req.body.url);
        const obj = { original_url: req.body.url, short_url: app.locals.key++ };

        console.log(obj);

        res.json(obj);
      }
    });
  }

});

app.get('/api/shorturl/:short_url', function(req, res) {
  let redirectUrl = app.locals.map.get(+req.params.short_url);

  console.log(`GET short_url: ${req.params.short_url}, isMapped: ${app.locals.map.has(+req.params.short_url)}, redirectUrl: ${redirectUrl}`);

  if (redirectUrl === undefined) {
    res.json({ error: 'Wrong format' });
  } else {
    res.redirect(redirectUrl);
  }
});

app.get('/*', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
