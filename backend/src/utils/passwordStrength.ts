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

export const MINIMUM_SCORE = 3;

export interface StrengthResult {
  score: number;
  warning: string;
  suggestions: string[];
}

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
