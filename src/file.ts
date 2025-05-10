import { StartedLocalStackContainer } from '@testcontainers/localstack';
import fs from 'fs';

export function writeToLocalstackFile(localstack: StartedLocalStackContainer) {
  const endpoint = localstack.getConnectionUri();
  console.log(`http://${localstack.getHost()}:${localstack.getMappedPort(4566)}`);
  console.log(`Endpoint: ${endpoint}`);
  writeToFile(JSON.stringify({ endpoint }), 'localstack-endpoint.json');
}

export function readFromLocalstackFile(filename: string) {
  const { endpoint } = JSON.parse(readFromFile('localstack-endpoint.json'));
  return `${endpoint}/${filename}`;
}

function writeToFile(content: string, filename: string) {
  fs.writeFileSync(filename, content);
}

function readFromFile(filename: string) {
  return fs.readFileSync(filename, 'utf8');
}
