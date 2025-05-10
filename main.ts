import { LocalstackContainer } from '@testcontainers/localstack';

async function main() {
  const localstack = await new LocalstackContainer('localstack/localstack:3').start();

  const awsConfig = {
    endpoint: localstack.getConnectionUri(),
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
    region: 'eu-central-1',
  };
}

main();
