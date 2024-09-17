const express = require("express");
const fs = require("fs");
const app = express();
const port = 8080;

app.use(express.json());

app.use(express.static(`${__dirname}/src`));

app.post("/graph/save/:filename", (req, res) => {
	let filename = req.params.filename;
	let graph = req.body;
	
	fs.writeFile(`${__dirname}/saves/${filename}`, JSON.stringify(graph), (error) => {
		if (error) {
			console.log(error);
		}
	});;
});

app.get("/graph/load/:filename", (req, res) => {
	let filename = req.params.filename;
	
	fs.readFile(`${__dirname}/saves/${filename}`, "utf8", (error, data) => {
		res.setHeader('Content-Type', 'application/json');
		res.json(data);

	});
});

app.get("/", (req, res) => {
	res.sendFile(`${__dirname}/index.html`);
});

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
