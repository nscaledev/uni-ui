import fs from 'fs';
import https from 'https';
import http from 'http';
import yaml from 'js-yaml';

const input = process.argv[2];
const outputFile = process.argv[3] || 'temp-spec.yaml';

function processSpec(data) {
	const spec = yaml.load(data);

	// Remove tags from all operations
	if (spec.paths) {
		Object.values(spec.paths).forEach((pathItem) => {
			Object.values(pathItem).forEach((operation) => {
				if (operation && operation.tags) {
					delete operation.tags;
				}
			});
		});
	}

	// Write back out
	fs.writeFileSync(outputFile, yaml.dump(spec));
	console.log(`Processed spec written to ${outputFile}`);
}

function fetchUrl(url) {
	const client = url.startsWith('https') ? https : http;

	client
		.get(url, (res) => {
			let data = '';
			res.on('data', (chunk) => (data += chunk));
			res.on('end', () => processSpec(data));
		})
		.on('error', (err) => {
			console.error('Error fetching spec:', err);
			process.exit(1);
		});
}

// Check if input is a URL or file path
if (input.startsWith('http://') || input.startsWith('https://')) {
	fetchUrl(input);
} else {
	// Treat as file path
	if (!fs.existsSync(input)) {
		console.error(`File not found: ${input}`);
		process.exit(1);
	}

	const data = fs.readFileSync(input, 'utf8');
	processSpec(data);
}
