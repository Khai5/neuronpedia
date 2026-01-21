import { describe, expect, test } from 'vitest';
import {
  BOS_TOKENS,
  LINE_BREAK_REPLACEMENT_CHAR,
  ACTIVATION_PRECISION,
  ACTIVATION_DISPLAY_DEFAULT_CONTEXT_TOKENS,
  HTML_ANOMALIES,
  HTML_ANOMALIES_NO_LINE_BREAK_CHAR,
  makeActivationBackgroundColorWithDFA,
  replaceHtmlAnomalies,
} from '@/lib/utils/activations';

describe('Constants', () => {
  test('BOS_TOKENS has expected values', () => {
    expect(BOS_TOKENS).toEqual(['<bos>', '<|endoftext|>', '<|begin_of_text|>']);
  });

  test('LINE_BREAK_REPLACEMENT_CHAR has expected value', () => {
    expect(LINE_BREAK_REPLACEMENT_CHAR).toBe('↵');
  });

  test('ACTIVATION_PRECISION has expected value', () => {
    expect(ACTIVATION_PRECISION).toBe(4);
  });

  test('ACTIVATION_DISPLAY_DEFAULT_CONTEXT_TOKENS has expected structure', () => {
    expect(ACTIVATION_DISPLAY_DEFAULT_CONTEXT_TOKENS).toHaveLength(3);
    expect(ACTIVATION_DISPLAY_DEFAULT_CONTEXT_TOKENS[0]).toEqual({ text: 'Stacked', size: 5 });
  });

  test('HTML_ANOMALIES contains expected mappings', () => {
    expect(HTML_ANOMALIES['Ġ']).toBe(' ');
    expect(HTML_ANOMALIES['Ċ']).toBe(LINE_BREAK_REPLACEMENT_CHAR);
    expect(HTML_ANOMALIES['\n']).toBe(LINE_BREAK_REPLACEMENT_CHAR);
  });

  test('HTML_ANOMALIES_NO_LINE_BREAK_CHAR preserves line breaks', () => {
    expect(HTML_ANOMALIES_NO_LINE_BREAK_CHAR['Ċ']).toBe('\n');
    expect(HTML_ANOMALIES_NO_LINE_BREAK_CHAR['<0x0A>']).toBe('\n');
  });
});

describe('replaceHtmlAnomalies', () => {
  test('replaces HTML anomalies in string', () => {
    const input = 'HelloĠworld';
    const result = replaceHtmlAnomalies(input);
    expect(result).toBe('Hello world');
  });

  test('replaces line breaks when replaceLineBreaks is true', () => {
    const input = 'Line1\nLine2';
    const result = replaceHtmlAnomalies(input, true);
    expect(result).toBe(`Line1${LINE_BREAK_REPLACEMENT_CHAR}Line2`);
  });

  test('preserves line breaks when replaceLineBreaks is false', () => {
    const input = 'Line1\nLine2';
    const result = replaceHtmlAnomalies(input, false);
    expect(result).toBe('Line1\nLine2');
  });

  test('handles null input', () => {
    const result = replaceHtmlAnomalies(null as any);
    expect(result).toBe('');
  });

  test('handles undefined input', () => {
    const result = replaceHtmlAnomalies(undefined as any);
    expect(result).toBe('');
  });

  test('handles empty string', () => {
    const result = replaceHtmlAnomalies('');
    expect(result).toBe('');
  });

  test('replaces multiple anomalies', () => {
    const input = 'âĢľquoteâĢĿ';
    const result = replaceHtmlAnomalies(input);
    expect(result).toBe('\u201Cquote\u201D');
  });
});

describe('makeActivationBackgroundColorWithDFA', () => {
  test('returns gradient string for basic activation', () => {
    const result = makeActivationBackgroundColorWithDFA(100, 50);
    expect(result).toContain('linear-gradient');
    expect(result).toContain('rgba');
  });

  test('handles zero value', () => {
    const result = makeActivationBackgroundColorWithDFA(100, 0);
    expect(result).toContain('rgba(52, 211, 153, 0)');
  });

  test('handles value equal to max', () => {
    const result = makeActivationBackgroundColorWithDFA(100, 100);
    expect(result).toContain('linear-gradient');
  });

  test('uses custom RGB color', () => {
    const result = makeActivationBackgroundColorWithDFA(100, 50, '255, 0, 0');
    expect(result).toContain('rgba(255, 0, 0');
  });

  test('handles DFA values', () => {
    const result = makeActivationBackgroundColorWithDFA(100, 50, '52, 211, 153', 30, 50);
    expect(result).toContain('linear-gradient');
    expect(result).toContain('rgba(251, 146, 60'); // orange-400 for DFA
  });

  test('handles zero DFA value', () => {
    const result = makeActivationBackgroundColorWithDFA(100, 50, '52, 211, 153', 0, 50);
    expect(result).toContain('linear-gradient');
  });

  test('handles very small values below threshold', () => {
    const result = makeActivationBackgroundColorWithDFA(100, 0.000001);
    expect(result).toContain('rgba(52, 211, 153, 0)');
  });

  test('handles DFA below threshold', () => {
    const result = makeActivationBackgroundColorWithDFA(100, 50, '52, 211, 153', 0.000001, 50);
    expect(result).toContain('linear-gradient');
  });
});
