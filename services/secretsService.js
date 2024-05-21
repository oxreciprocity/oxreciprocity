// Gets API keys from Google Cloud Secret Manager
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const secretClient = new SecretManagerServiceClient();

async function getSecretFromGCP(secretName) {
  const [version] = await secretClient.accessSecretVersion({
    name: secretName,
  });
  return version.payload.data.toString('utf8');
}

export async function getSecret(name) {
  if (process.env.NODE_ENV === 'development') {
    // In development, return the secret from .env
    return process.env[name];
  } else {
    // In production, fetch the secret from Google Cloud Secret Manager
    const projectId = process.env.GCLOUD_PROJECT;
    const secretName = `projects/${projectId}/secrets/${name}/versions/latest`; // Customize this path as needed
    return getSecretFromGCP(secretName);
  }
}