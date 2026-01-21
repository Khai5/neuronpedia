import { describe, expect, test } from 'vitest';
import { UserSecretType } from '@prisma/client';
import {
  EXPLANATIONTYPE_HUMAN,
  AutoInterpModelType,
  ERROR_NO_AUTOINTERP_KEY,
  ERROR_REQUIRES_OPENROUTER,
  ERROR_RECALL_ALT_FAILED,
  OPENROUTER_BASE_URL,
  isReasoningModel,
  getAutoInterpModelTypeFromModelId,
  getKeyTypeForAutoInterpModelType,
  requiresOpenRouterForExplanationType,
  requiresOpenRouterForExplanationScoreType,
} from '@/lib/utils/autointerp';

describe('Constants', () => {
  test('EXPLANATIONTYPE_HUMAN has expected value', () => {
    expect(EXPLANATIONTYPE_HUMAN).toBe('human');
  });

  test('ERROR_NO_AUTOINTERP_KEY has expected value', () => {
    expect(ERROR_NO_AUTOINTERP_KEY).toBe('No auto-interp key found for user.');
  });

  test('ERROR_REQUIRES_OPENROUTER has expected value', () => {
    expect(ERROR_REQUIRES_OPENROUTER).toBe('This autointerp type requires an OpenRouter key.');
  });

  test('ERROR_RECALL_ALT_FAILED has expected value', () => {
    expect(ERROR_RECALL_ALT_FAILED).toBe(
      'All scoring requests failed. Check that you have enough credits in your API key (Either OpenRouter or others), and that your key has not been revoked.',
    );
  });

  test('OPENROUTER_BASE_URL has expected value', () => {
    expect(OPENROUTER_BASE_URL).toBe('https://openrouter.ai/api/v1');
  });
});

describe('AutoInterpModelType', () => {
  test('has expected enum values', () => {
    expect(AutoInterpModelType.OPENAI).toBe('openai');
    expect(AutoInterpModelType.ANTHROPIC).toBe('anthropic');
    expect(AutoInterpModelType.GOOGLE).toBe('google');
    expect(AutoInterpModelType.UNKNOWN).toBe('unknown');
  });
});

describe('isReasoningModel', () => {
  test('returns true for o1 models', () => {
    expect(isReasoningModel('o1-preview')).toBe(true);
    expect(isReasoningModel('o1-mini')).toBe(true);
  });

  test('returns true for o3 models', () => {
    expect(isReasoningModel('o3-mini')).toBe(true);
    expect(isReasoningModel('o3-sonnet')).toBe(true);
  });

  test('returns true for deepseek-r1 models', () => {
    expect(isReasoningModel('deepseek-r1')).toBe(true);
    expect(isReasoningModel('deepseek-r1-distill')).toBe(true);
  });

  test('returns true for models with -thinking suffix', () => {
    expect(isReasoningModel('gpt-4-thinking')).toBe(true);
    expect(isReasoningModel('some-model-thinking')).toBe(true);
  });

  test('returns false for non-reasoning models', () => {
    expect(isReasoningModel('gpt-4')).toBe(false);
    expect(isReasoningModel('claude-3-opus')).toBe(false);
    expect(isReasoningModel('gemini-pro')).toBe(false);
  });
});

describe('getAutoInterpModelTypeFromModelId', () => {
  test('returns OPENAI for gpt models', () => {
    expect(getAutoInterpModelTypeFromModelId('gpt-4')).toBe(AutoInterpModelType.OPENAI);
    expect(getAutoInterpModelTypeFromModelId('gpt-3.5-turbo')).toBe(AutoInterpModelType.OPENAI);
  });

  test('returns OPENAI for o1 models', () => {
    expect(getAutoInterpModelTypeFromModelId('o1-preview')).toBe(AutoInterpModelType.OPENAI);
    expect(getAutoInterpModelTypeFromModelId('o1-mini')).toBe(AutoInterpModelType.OPENAI);
  });

  test('returns OPENAI for o3 models', () => {
    expect(getAutoInterpModelTypeFromModelId('o3-mini')).toBe(AutoInterpModelType.OPENAI);
    expect(getAutoInterpModelTypeFromModelId('o3-sonnet')).toBe(AutoInterpModelType.OPENAI);
  });

  test('returns OPENAI for o4 models', () => {
    expect(getAutoInterpModelTypeFromModelId('o4-preview')).toBe(AutoInterpModelType.OPENAI);
  });

  test('returns ANTHROPIC for claude models', () => {
    expect(getAutoInterpModelTypeFromModelId('claude-3-opus')).toBe(AutoInterpModelType.ANTHROPIC);
    expect(getAutoInterpModelTypeFromModelId('claude-sonnet')).toBe(AutoInterpModelType.ANTHROPIC);
  });

  test('returns GOOGLE for gemini models', () => {
    expect(getAutoInterpModelTypeFromModelId('gemini-pro')).toBe(AutoInterpModelType.GOOGLE);
    expect(getAutoInterpModelTypeFromModelId('gemini-ultra')).toBe(AutoInterpModelType.GOOGLE);
  });

  test('returns UNKNOWN for unrecognized models', () => {
    expect(getAutoInterpModelTypeFromModelId('unknown-model')).toBe(AutoInterpModelType.UNKNOWN);
    expect(getAutoInterpModelTypeFromModelId('')).toBe(AutoInterpModelType.UNKNOWN);
  });
});

describe('getKeyTypeForAutoInterpModelType', () => {
  test('returns OPENAI for OPENAI model type', () => {
    expect(getKeyTypeForAutoInterpModelType(AutoInterpModelType.OPENAI)).toBe(UserSecretType.OPENAI);
  });

  test('returns ANTHROPIC for ANTHROPIC model type', () => {
    expect(getKeyTypeForAutoInterpModelType(AutoInterpModelType.ANTHROPIC)).toBe(UserSecretType.ANTHROPIC);
  });

  test('returns GOOGLE for GOOGLE model type', () => {
    expect(getKeyTypeForAutoInterpModelType(AutoInterpModelType.GOOGLE)).toBe(UserSecretType.GOOGLE);
  });

  test('returns OPENROUTER for UNKNOWN model type', () => {
    expect(getKeyTypeForAutoInterpModelType(AutoInterpModelType.UNKNOWN)).toBe(UserSecretType.OPENROUTER);
  });
});

describe('requiresOpenRouterForExplanationType', () => {
  test('returns true for eleuther_acts_top20', () => {
    expect(requiresOpenRouterForExplanationType('eleuther_acts_top20')).toBe(true);
  });

  test('returns false for other explanation types', () => {
    expect(requiresOpenRouterForExplanationType('human')).toBe(false);
    expect(requiresOpenRouterForExplanationType('other-type')).toBe(false);
    expect(requiresOpenRouterForExplanationType('')).toBe(false);
  });
});

describe('requiresOpenRouterForExplanationScoreType', () => {
  test('returns true for recall_alt', () => {
    expect(requiresOpenRouterForExplanationScoreType('recall_alt')).toBe(true);
  });

  test('returns true for eleuther_fuzz', () => {
    expect(requiresOpenRouterForExplanationScoreType('eleuther_fuzz')).toBe(true);
  });

  test('returns true for eleuther_recall', () => {
    expect(requiresOpenRouterForExplanationScoreType('eleuther_recall')).toBe(true);
  });

  test('returns false for other score types', () => {
    expect(requiresOpenRouterForExplanationScoreType('other-type')).toBe(false);
    expect(requiresOpenRouterForExplanationScoreType('')).toBe(false);
  });
});
