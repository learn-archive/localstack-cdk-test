import { CreateQueueCommand } from '@aws-sdk/client-sqs';
import { LocalstackContainer, StartedLocalStackContainer } from '@testcontainers/localstack';
import { writeToLocalstackFile } from './file';
import { initSqs } from './sqs';
import { QUEUE_NAME } from './test';

export async function startLocalstack(): Promise<StartedLocalStackContainer> {
  // Start LocalStack container
  const localstack = await new LocalstackContainer('localstack/localstack:3').start();

  console.log(`LocalStack started at: ${localstack.getConnectionUri()}`);

  // Write the localstack endpoint to a file
  writeToLocalstackFile(localstack);

  // Create SQS client
  const sqsClient = initSqs();

  // Create a new SQS queue
  const createQueueResponse = await sqsClient.send(
    new CreateQueueCommand({
      QueueName: QUEUE_NAME,
      Attributes: {
        DelaySeconds: '0',
        MessageRetentionPeriod: '86400', // 24 hours
      },
    }),
  );

  const queueUrl = createQueueResponse.QueueUrl;
  console.log(`SQS Queue created successfully: ${queueUrl}`);
  return localstack;
}

export async function stopLocalstack(localstack: StartedLocalStackContainer): Promise<void> {
  await localstack.stop();
}
