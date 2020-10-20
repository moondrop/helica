request = function()
    wrk.headers["Connection"] = "Keep-Alive"
    randomNumber = math.random(1, 1024)
    path = "/random/" .. randomNumber
    return wrk.format("GET", path)
end