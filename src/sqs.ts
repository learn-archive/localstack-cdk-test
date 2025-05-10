import {
  Message,
  PurgeQueueCommand,
  ReceiveMessageCommand,
  SendMessageBatchCommand,
  SendMessageBatchRequestEntry,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { readFromLocalstackFile } from './file';
import { AWS_REGION, randomUUID } from './test';

let sqsClient: SQSClient;

export async function sendSqsMessages<T>(queueUrl: string, messages: T[]): Promise<void> {
  initSqs();
  const cmd = new SendMessageBatchCommand({
    QueueUrl: queueUrl,
    Entries: formatMessagesToBatchMessages<T>(messages),
  });

  await sqsClient.send(cmd);
}

export async function getSqsMessages(queueUrl: string): Promise<Message[]> {
  initSqs();
  const cmd = new ReceiveMessageCommand({
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 10,
  });

  const { Messages } = await sqsClient.send(cmd);
  return formatSqsRecevedMessages(Messages || []);
}

export async function deleteAllSqsMessages(queueUrl: string) {
  initSqs();
  const cmd = new PurgeQueueCommand({
    QueueUrl: queueUrl,
  });

  await sqsClient.send(cmd);
}

export function formatSqsRecevedMessages<T>(messages: Message[]): T {
  return messages.map((m: Message) => JSON.parse(m?.Body || '')) as T;
}

export function formatMessagesToBatchMessages<T>(messages: T[]): SendMessageBatchRequestEntry[] {
  return messages.map((m) => {
    return {
      Id: randomUUID(),
      MessageBody: JSON.stringify(m),
    };
  });
}

export function initSqs(): SQSClient {
  if (sqsClient) return sqsClient;
  sqsClient = new SQSClient({
    region: AWS_REGION,
    endpoint: readFromLocalstackFile('localstack-endpoint.json'),
  });
  return sqsClient;
}

// // Send a message to the queue
// const sendMessageResponse = await sqsClient.send(
//   new SendMessageCommand({
//     QueueUrl: queueUrl,
//     MessageBody: 'Hello from LocalStack!',
//     DelaySeconds: 0,
//   }),
// );

// console.log(`Message sent successfully: ${sendMessageResponse.MessageId}`);

// // Receive messages from the queue
// const receiveMessageResponse = await sqsClient.send(
//   new ReceiveMessageCommand({
//     QueueUrl: queueUrl,
//     MaxNumberOfMessages: 1,
//     WaitTimeSeconds: 5,
//   }),
// );

// if (receiveMessageResponse.Messages && receiveMessageResponse.Messages.length > 0) {
//   const message = receiveMessageResponse.Messages[0];
//   console.log(`Received message: ${message.Body}`);

//   // Delete the message from the queue
//   await sqsClient.send(
//     new DeleteMessageCommand({
//       QueueUrl: queueUrl,
//       ReceiptHandle: message.ReceiptHandle,
//     }),
//   );

//   console.log('Message deleted successfully');
// } else {
//   console.log('No messages received');
// }
