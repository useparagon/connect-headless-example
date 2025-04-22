/// <reference types="vite/client" />

import { paragon } from '@useparagon/connect';

declare global {
  interface Window {
    paragon: typeof paragon;
  }
}
