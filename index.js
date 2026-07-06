
const express = require('express')
const app = express()
const Redis = require('ioredis');
const redis = new Redis();


async function rateLimiter(req, res, next) {
  const key = req.ip;
  const currentCount = await redis.incr(key)

  if (currentCount === 1) {
    redis.expire(key, 60)
    next()
  }
  else if (currentCount <= 3) {
    next()
  }
  else {
    res.status(429).send("Too many requests")
  }
}




app.use(rateLimiter)
app.get('/', (req, res) => {
  res.send('Hello Rate!');
});
app.listen(3000)
