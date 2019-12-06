const fs = require("fs");
const url = require("url");
const http = require("http");
const https = require("https");

const host = "localhost";
const port = 3000;

const githubjobs_api = "https://jobs.github.com/positions.json?description=";

const new_connection = function (req, res) {
    if (req.url === "/") {
        res.writeHead(200, {"Content-Type": "text/html"});
        fs.createReadStream("./html/index.html").pipe(res);
    }
    else if (req.url.startsWith("/search")) {
        let user_input = url.parse(req.url, true).query.title;
        https.get(`${githubjobs_api}${user_input}`, function (github_jobs_stream) {
            let job_data = "";
            github_jobs_stream.on("data", (chunk) => job_data += chunk);
            github_jobs_stream.on("end", function () {
                let all_jobs = JSON.parse(job_data);
                let output = all_jobs.map(generate_job_description).join("");
                res.writeHead(200, {"Content-Type": "text/html"});
                res.end(`<h1>Search Results:</h1><ul>${output}</ul>`);
            });
        });
    }
    else {
        res.writeHead(404);
        res.end();
    }
};

const generate_job_description = function (job) {
    return `<li><p><a href="${job.url}">${job.title}<a></p></li><p>${job.company}</p>`;
};

const server = http.createServer(new_connection);
server.listen(port, host);
console.log(`Now Listening on Port ${host}:${port}`);