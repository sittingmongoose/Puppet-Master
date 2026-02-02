declare module 'semver' {
  const semver: {
    gte(version: string, range: string, loose?: boolean): boolean;
  };

  export default semver;
}

