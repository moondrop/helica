# Helica Benchmarks

All benchmarks were concluded on the same machine, network and port with the following testing methodology:

**Hardware:** MacBook Air Late 2017 (1.8 GHz Dual-Core Intel Core i5, 8 GB 1600 MHz DDR3)

**Benchmarking Suite:** wrk

**Settings:** 2 Threads, 100 Connections, 30s Duration, Random Numbers

## Results
![Helica Benchmark Results](https://i.imgur.com/QwdIowE.png)

## Detailed Results

All results are ordered by performance *(descending)*.

**Helica:**
```
❯ wrk -t2 -c100 -d30s -s benchmark/work_param.lua http://localhost:28785/
Running 30s test @ http://localhost:28785/
  2 threads and 100 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     2.12ms    2.32ms  54.82ms   96.01%
    Req/Sec    20.62k     4.76k   41.69k    67.11%
  1233754 requests in 30.10s, 95.75MB read
Requests/sec:  40988.87
Transfer/sec:      3.18MB
```

**Rayo:**
```
❯ wrk -t2 -c100 -d30s -s benchmark/work_param.lua http://localhost:28785/
Running 30s test @ http://localhost:28785/
  2 threads and 100 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     7.77ms    6.99ms 142.68ms   95.51%
    Req/Sec     6.98k     2.23k    9.98k    58.67%
  417233 requests in 30.05s, 59.04MB read
Requests/sec:  13884.45
Transfer/sec:      1.96MB
```

**Polka:**
```
❯ wrk -t2 -c100 -d30s -s benchmark/work_param.lua http://localhost:28785/
Running 30s test @ http://localhost:28785/
  2 threads and 100 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     9.30ms   12.16ms 228.62ms   94.95%
    Req/Sec     6.61k     2.47k   14.53k    63.04%
  394424 requests in 30.09s, 55.81MB read
Requests/sec:  13108.66
Transfer/sec:      1.85MB
```

**Koa:**
```
❯ wrk -t2 -c100 -d30s -s benchmark/work_param.lua http://localhost:28785/
Running 30s test @ http://localhost:28785/
  2 threads and 100 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     9.49ms    6.88ms 176.03ms   93.62%
    Req/Sec     5.65k     1.67k    8.20k    66.17%
  338255 requests in 30.09s, 61.09MB read
Requests/sec:  11243.25
Transfer/sec:      2.03MB
```

**Opine (Deno):**
```
❯ wrk -t2 -c100 -d30s -s benchmark/work_param.lua http://localhost:28785/
Running 30s test @ http://localhost:28785/
  2 threads and 100 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    14.76ms   18.18ms 279.89ms   95.42%
    Req/Sec     4.00k     1.09k    5.55k    84.37%
  238492 requests in 30.06s, 19.42MB read
Requests/sec:   7932.99
Transfer/sec:    661.44KB
```

**Express:**
```
❯ wrk -t2 -c100 -d30s -s benchmark/work_param.lua http://localhost:28785/
Running 30s test @ http://localhost:28785/
  2 threads and 100 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency    14.07ms    6.64ms 133.86ms   89.90%
    Req/Sec     3.64k     1.00k    5.18k    62.33%
  217716 requests in 30.07s, 35.58MB read
Requests/sec:   7239.50
Transfer/sec:      1.18MB
```