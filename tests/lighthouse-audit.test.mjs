import fs from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { classifyLighthouseResult } = require('../tools/lighthouse-audit.js');
const { browserCandidates, detectBrowserPath } = require('../tools/lighthouse-browser.js');

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('browser selection', () => {
  it('prefers Chrome over Edge', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation((candidate) => {
      return candidate === browserCandidates[0] || candidate === browserCandidates[7];
    });

    expect(detectBrowserPath()).toBe(browserCandidates[0]);
  });

  it('uses CHROME_PATH when it exists', () => {
    vi.stubEnv('CHROME_PATH', 'C:\\Custom\\chrome.exe');
    vi.spyOn(fs, 'existsSync').mockImplementation((candidate) => {
      return candidate === 'C:\\Custom\\chrome.exe' || candidate === browserCandidates[4];
    });

    expect(detectBrowserPath()).toBe('C:\\Custom\\chrome.exe');
  });

  it('prefers Edge over Brave when Chrome is absent', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation((candidate) => {
      return candidate === browserCandidates[7] || candidate === browserCandidates[9];
    });

    expect(detectBrowserPath()).toBe(browserCandidates[7]);
  });

  it('falls back to Brave when Chrome and Edge are absent', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation((candidate) => {
      return candidate === browserCandidates[9];
    });

    expect(detectBrowserPath()).toBe(browserCandidates[9]);
  });
});

describe('lighthouse result classification', () => {
  it('treats EPERM noise with a report as non-fatal', () => {
    const result = classifyLighthouseResult({
      status: 1,
      hasReport: true,
      stderr: 'Error: something\nEPERM: permission denied, unlink C:\\Temp\\lighthouse',
    });

    expect(result.kind).toBe('cleanup-noise');
    expect(result.exitStatus).toBe(0);
    expect(result.hasCleanupNoise).toBe(true);
  });

  it('fails when no report exists', () => {
    const result = classifyLighthouseResult({
      status: 0,
      hasReport: false,
      stderr: '',
    });

    expect(result.kind).toBe('fatal-no-report');
    expect(result.exitStatus).toBe(1);
  });

  it('fails when report exists but error is not cleanup noise', () => {
    const result = classifyLighthouseResult({
      status: 1,
      hasReport: true,
      stderr: 'Error: Protocol error (Performance.enable): target closed.',
    });

    expect(result.kind).toBe('fatal-with-report');
    expect(result.exitStatus).toBe(1);
    expect(result.summary).toContain('Protocol error');
  });

  it('does not downgrade mixed cleanup and crash noise', () => {
    const result = classifyLighthouseResult({
      status: 1,
      hasReport: true,
      stderr: 'EPERM: permission denied\nProtocol error (Runtime.callFunctionOn): target closed.',
    });

    expect(result.kind).toBe('fatal-with-report');
    expect(result.exitStatus).toBe(1);
  });
});
