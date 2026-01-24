import { describe, it, expect } from 'vitest';
import { getNodeDistribution } from './node-distribution.js';

describe('getNodeDistribution', () => {
  it('builds the correct Windows (zip) URL and extracted dir', () => {
    const dist = getNodeDistribution({ version: '20.11.1', platform: 'win32', arch: 'x64' });
    expect(dist.filename).toBe('node-v20.11.1-win-x64.zip');
    expect(dist.url).toBe('https://nodejs.org/dist/v20.11.1/node-v20.11.1-win-x64.zip');
    expect(dist.extractedTopLevelDirName).toBe('node-v20.11.1-win-x64');
  });

  it('accepts versions with leading v', () => {
    const dist = getNodeDistribution({ version: 'v20.11.1', platform: 'linux', arch: 'x64' });
    expect(dist.filename).toBe('node-v20.11.1-linux-x64.tar.xz');
    expect(dist.url).toBe('https://nodejs.org/dist/v20.11.1/node-v20.11.1-linux-x64.tar.xz');
  });

  it('builds the correct macOS (tar.gz) URL and extracted dir', () => {
    const dist = getNodeDistribution({ version: '20.11.1', platform: 'darwin', arch: 'arm64' });
    expect(dist.filename).toBe('node-v20.11.1-darwin-arm64.tar.gz');
    expect(dist.extractedTopLevelDirName).toBe('node-v20.11.1-darwin-arm64');
  });

  it('throws on unsupported platform', () => {
    expect(() =>
      getNodeDistribution({ version: '20.11.1', platform: 'aix' as never, arch: 'x64' })
    ).toThrow(/Unsupported platform/);
  });
});

