const fs = require("fs");
const http = require("http");
const https = require("https");
const os = require("os");
const path = require("path");

const root = __dirname;
const certificateDirectory = path.join(root, "certs");
const certificatePath = path.join(certificateDirectory, "lan.pem");
const privateKeyPath = path.join(certificateDirectory, "lan-key.pem");
const hasCertificate = fs.existsSync(certificatePath);
const hasPrivateKey = fs.existsSync(privateKeyPath);

if (hasCertificate !== hasPrivateKey) {
    console.error(
        "HTTPS needs both certs/lan.pem and certs/lan-key.pem."
    );
    process.exit(1);
}

const useHttps = hasCertificate && hasPrivateKey;
const protocol = useHttps ? "https" : "http";
const port = Number(
    process.env.PORT || (useHttps ? 8443 : 8000)
);
const mimeTypes = {
    ".css": "text/css; charset=utf-8",
    ".gif": "image/gif",
    ".html": "text/html; charset=utf-8",
    ".ico": "image/x-icon",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp"
};
const publicPaths = new Set([
    "about.html",
    "dashboard.html",
    "index.html",
    "map.html",
    "result.html",
    "scan.html",
    "css",
    "images",
    "js"
]);

const handleRequest = function(request, response) {

        if (request.method !== "GET" && request.method !== "HEAD") {
            response.writeHead(405, { Allow: "GET, HEAD" });
            response.end("Method not allowed");
            return;
        }

        let pathname;

        try {
            pathname = decodeURIComponent(
                new URL(request.url, "http://localhost").pathname
            );
        } catch (error) {
            response.writeHead(400);
            response.end("Bad request");
            return;
        }

        let filePath = path.resolve(root, `.${pathname}`);
        const relativePath = path.relative(root, filePath);
        const topLevelPath = relativePath.split(path.sep)[0];

        if (
            filePath !== root &&
            !filePath.startsWith(`${root}${path.sep}`)
        ) {
            response.writeHead(403);
            response.end("Forbidden");
            return;
        }

        if (topLevelPath && !publicPaths.has(topLevelPath)) {
            response.writeHead(404);
            response.end("Not found");
            return;
        }

        if (
            relativePath === "certs" ||
            relativePath.startsWith(`certs${path.sep}`) ||
            /\.(?:key|pem)$/i.test(filePath)
        ) {
            response.writeHead(403);
            response.end("Forbidden");
            return;
        }

        fs.stat(filePath, function(statError, stats) {

            if (statError) {
                response.writeHead(404);
                response.end("Not found");
                return;
            }

            if (stats.isDirectory()) {
                filePath = path.join(filePath, "index.html");
            }

            fs.readFile(filePath, function(readError, content) {

                if (readError) {
                    response.writeHead(404);
                    response.end("Not found");
                    return;
                }

                response.writeHead(200, {
                    "Content-Type":
                        mimeTypes[path.extname(filePath).toLowerCase()] ||
                        "application/octet-stream",
                    "X-Content-Type-Options": "nosniff"
                });
                response.end(
                    request.method === "HEAD" ? undefined : content
                );

            });

        });

};

const server = useHttps
    ? https.createServer(
        {
            cert: fs.readFileSync(certificatePath),
            key: fs.readFileSync(privateKeyPath)
        },
        handleRequest
    )
    : http.createServer(handleRequest);

server.on("error", function(error) {
    console.error(`Could not start EcoScan LAN server: ${error.message}`);
    process.exitCode = 1;
});

server.listen(port, "0.0.0.0", function() {

    console.log(
        `EcoScan LAN server listening over ${protocol.toUpperCase()} on port ${port}`
    );

    for (const [interfaceName, addresses] of Object.entries(
        os.networkInterfaces()
    )) {
        for (const address of addresses || []) {
            if (
                address.family === "IPv4" &&
                !address.internal
            ) {
                console.log(
                    `${interfaceName}: ${protocol}://${address.address}:${port}/`
                );
            }
        }
    }

});