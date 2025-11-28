/// <reference types="@types/google.maps" />

// Extend the Window interface to include google
declare global {
  interface Window {
    google: typeof google;
  }
}

export {};
