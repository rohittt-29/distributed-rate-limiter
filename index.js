
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
async function slidingWindowLimiter(req, res, next) {
  const key = req.ip;
  const currentTime = Date.now();
  const cutoffTime = currentTime - 60000;

  await redis.zremrangebyscore(key, 0, cutoffTime);
  const count = await redis.zcard(key);

  if (count < 3) {
    await redis.zadd(key, currentTime, `${currentTime}-${Math.random()}`);
    next();
  } else {
    res.status(429).send("too many requests");
  }
}



// app.use(rateLimiter)
app.get('/', (req, res) => {
  res.send('Hello Rate!');
});
app.get('/sliding', slidingWindowLimiter, (req, res) => {
  res.send('Sliding window test!');
});
app.listen(3000)
