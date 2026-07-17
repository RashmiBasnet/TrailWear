import { ZxcvbnFactory } from '@zxcvbn-ts/core';
import * as zxcvbnCommon from '@zxcvbn-ts/language-common';
import * as zxcvbnEn from '@zxcvbn-ts/language-en';

const zxcvbn = new ZxcvbnFactory({
  dictionary: {
    ...zxcvbnCommon.dictionary,
    ...zxcvbnEn.dictionary,
  },
  graphs: zxcvbnCommon.adjacencyGraphs,
  translations: zxcvbnEn.translations,
});

/**
 * zxcvbn scores 0-4 by estimated guesses rather than character classes, so it
 * rejects passwords the regex rules happily accept — "Password123" satisfies
 * upper + lower + digit but is guessed almost immediately. 3 means "safely
 * unguessable" (>= 10^8 guesses).
 */
export const MINIMUM_SCORE = 3;

export interface StrengthResult {
  score: number;
  warning: string;
  suggestions: string[];
}

/**
 * Scores a password, penalising terms taken from the user's own details so
 * "rashmi@trailwear.com" / "Rashmi2026" scores as the weak password it is.
 */
export function scorePassword(password: string, userInputs: string[] = []): StrengthResult {
  const result = zxcvbn.check(password, userInputs.filter(Boolean));
  return {
    score: result.score,
    warning: result.feedback.warning ?? '',
    suggestions: result.feedback.suggestions ?? [],
  };
}

export function isStrongEnough(
  password: string,
  userInputs: string[] = []
): StrengthResult & { ok: boolean } {
  const result = scorePassword(password, userInputs);
  return { ...result, ok: result.score >= MINIMUM_SCORE };
}
