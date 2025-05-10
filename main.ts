import { CreateQueueCommand, DeleteMessageCommand, ReceiveMessageCommand, SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { LocalstackContainer } from '@testcontainers/localstack';

async function main() {
  // Start LocalStack container
  const localstack = await new LocalstackContainer('localstack/localstack:3').start();

  console.log(`LocalStack started at: ${localstack.getConnectionUri()}`);

  // Configure AWS
  const awsConfig = {
    endpoint: localstack.getConnectionUri(),
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
    region: 'eu-central-1',
  };

  // Create SQS client
  const sqsClient = new SQSClient(awsConfig);

  // Queue name
  const queueName = 'my-test-queue';

  try {
    // Create a new SQS queue
    const createQueueResponse = await sqsClient.send(
      new CreateQueueCommand({
        QueueName: queueName,
        Attributes: {
          DelaySeconds: '0',
          MessageRetentionPeriod: '86400', // 24 hours
        },
      }),
    );

    const queueUrl = createQueueResponse.QueueUrl;
    console.log(`SQS Queue created successfully: ${queueUrl}`);

    // Send a message to the queue
    const sendMessageResponse = await sqsClient.send(
      new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: 'Hello from LocalStack!',
        DelaySeconds: 0,
      }),
    );

    console.log(`Message sent successfully: ${sendMessageResponse.MessageId}`);

    // Receive messages from the queue
    const receiveMessageResponse = await sqsClient.send(
      new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 5,
      }),
    );

    if (receiveMessageResponse.Messages && receiveMessageResponse.Messages.length > 0) {
      const message = receiveMessageResponse.Messages[0];
      console.log(`Received message: ${message.Body}`);

      // Delete the message from the queue
      await sqsClient.send(
        new DeleteMessageCommand({
          QueueUrl: queueUrl,
          ReceiptHandle: message.ReceiptHandle,
        }),
      );

      console.log('Message deleted successfully');
    } else {
      console.log('No messages received');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Stop the container when done
    await localstack.stop();
    console.log('LocalStack container stopped');
  }
}

main();
