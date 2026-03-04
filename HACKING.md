# Hacking

## Dev workflow

Install dependencies:

```
npm ci
```

If working on the **core lib**, run TypeScript:

```
npm -w twrl run watch
```

Or run the tests:

```
npm -w twrl run test
```

Or build:

```
npm -w twrl run build
```

If working on the **website**, run TypeScript:

```
npm -w twrl-website run watch
```

Or serve:

```
npm -w twrl-website dev
```

Or build & preview:

```
npm -w twrl-website run build && npm -w twrl-website run preview
```

## Release instructions

Bump the version in the libary's package.json.

Clean install:

```
npm ci && rm -rf ./packages/twrl/dist
```

Build the library:

```
npm -w twrl run build
```

Preview the tarball:

```
npm -w twrl pack
```

Publish the package:

```
npm -w twrl publish
```

Commit the version bump.
