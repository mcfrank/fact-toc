export interface FactData {
  fact: string;
  domain: string;
  emoji: string;
  backgroundColor: string; // Tailwind class suggestion
}

export enum AppState {
  START_SCREEN = 'START_SCREEN',
  LOADING = 'LOADING',
  SHOWING_FACT = 'SHOWING_FACT',
  EXIT = 'EXIT',
  ERROR = 'ERROR'
}

export enum InteractionStage {
  DID_YOU_KNOW = 'DID_YOU_KNOW',
  WHAT_NEXT = 'WHAT_NEXT'
}

export enum FactComplexity {
  SIMPLE = 'simple',
  COMPLEX = 'complex'
}

export const DOMAINS = [
  'Space',
  'Animals',
  'Machines',
  'Outdoors'
];