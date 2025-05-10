import { SQSClient } from '@aws-sdk/client-sqs';
import { StartedLocalStackContainer } from '@testcontainers/localstack';
import { readFromLocalstackFile } from './file';
import { startLocalstack, stopLocalstack } from './main';
import { deleteAllSqsMessages, getSqsMessages, initSqs, sendSqsMessages } from './sqs';

jest.setTimeout(20000);

describe('Sqs integration', () => {
  let sqsClient: SQSClient;
  let queueUrl: string;
  let localstack: StartedLocalStackContainer;

  beforeAll(async () => {
    localstack = await startLocalstack();
    const endpoint = readFromLocalstackFile('localstack-endpoint.json');
    // queueUrl = `${endpoint}/000000000000/${QUEUE_NAME}`;
    queueUrl = 'http://sqs.eu-central-1.localhost:4566/000000000000/my-test-queue';
    sqsClient = initSqs();
  });

  afterAll(async () => {
    await stopLocalstack(localstack);
  });

  beforeEach(async () => {
    await deleteAllSqsMessages(queueUrl);
  });

  test('should send 2 sqs messages', async () => {
    // Given
    const message1 = { message: 'fakeMessage1' };
    const message2 = { message: 'fakeMessage2' };
    const messages = [message1, message2];

    // When
    await sendSqsMessages(queueUrl, messages);
    const messagesBeforePurge = await getSqsMessages(queueUrl);
    await deleteAllSqsMessages(queueUrl);
    const messagesAfterPurge = await getSqsMessages(queueUrl);

    // Then
    expect(messagesBeforePurge).toHaveLength(2);
    expect(messagesAfterPurge).toHaveLength(0);
  });
});
