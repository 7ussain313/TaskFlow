import { isAxiosError } from 'axios';

// Extracts a displayable string from the backend's { statusCode, message, error }
// response shape — message may be a single string or an array of validation errors.
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message as string | string[] | undefined;
    if (Array.isArray(message)) return message.join(', ');
    if (message) return message;
  }
  return 'Something went wrong. Please try again.';
}
