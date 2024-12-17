# Rsbuild Utils

Helper functions for setting up custom chunks in [Rsbuild](https://rsbuild.dev/).
Supports only [PNPM](https://pnpm.io/) for now.

## Installation

```bash
pnpm add -D @mutsuntsai/rsbuild-utils
```

## Usage

```ts
/**
 * Create a test function such that it returns true if and only if
 * the module matches any of the given {@link RegExp}s.
 */
export declare function makeTest(...tests: RegExp[]): (m: unknown) => boolean;

/**
 * Based on the dependencies recorded in `pnpm-lock.yaml` file,
 * create a {@link RegExp} that covers all descendant packages of the given packages.
 *
 * Note that this function has a side-effect: it will not include
 * packages that were collected during previous calls of this function.
 */
export declare function createDescendantRegExp(...names: string[]): RegExp;
```