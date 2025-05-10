import {
  Message,
  PurgeQueueCommand,
  ReceiveMessageCommand,
  SendMessageBatchCommand,
  SendMessageBatchRequestEntry,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { randomUUID } from './test';

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

function initSqs(): SQSClient {
  if (sqsClient) return sqsClient;
  sqsClient = new SQSClient({
    region: 'eu-west-3',
    endpoint: 'http://127.0.0.1:4566',
  });
  return sqsClient;
}
