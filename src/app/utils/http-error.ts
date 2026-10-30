import { HttpErrorResponse } from '@angular/common/http';

// The messages of the backend are not very friendly (and some have typos),
// so the known ones are changed here before they are shown to the user.
const friendlyMessages: { test: RegExp; text: string }[] = [
  { test: /invailed/i, text: 'Incorrect email or password.' },
  { test: /activate your account/i, text: 'Please activate your account first. Check your email for the activation link.' },
  { test: /email is already exist/i, text: 'This email is already registered. Try logging in instead.' },
  { test: /forbidden/i, text: 'You do not have permission to do this.' },
  { test: /reading 'split'/i, text: 'Please log in to continue.' },
  { test: /jwt|invalid signature|invalid token/i, text: 'Your session has expired. Please log in again.' },
  { test: /user not found/i, text: 'This account no longer exists. Please log in again.' },
  { test: /E11000|duplicate key/i, text: 'This name is already used. Please choose another one.' }
];

export function getErrorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'Cannot reach the server. Please check that the backend is running and try again.';
    }

    const message: string = err.error && err.error.message ? String(err.error.message) : '';
    if (message) {
      const found = friendlyMessages.find(m => m.test.test(message));
      return found ? found.text : message;
    }

    if (err.status === 404) {
      return 'The requested data was not found.';
    }
    if (err.status >= 500) {
      return 'The server has a problem right now. Please try again later.';
    }
  } else if (err instanceof Error) {
    return err.message;
  }

  return 'Something went wrong. Please try again.';
}

// the ids of MongoDB are 24 characters (numbers and letters a-f)
export function isValidId(id: string): boolean {
  return /^[a-f0-9]{24}$/i.test(id);
}
