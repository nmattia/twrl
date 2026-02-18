# Release instructions

Bump the version in the libary's package.json.

Clean install:

```
npm ci && rm -rf ./packages/twrl/dist
```

Build the library:

```
npm -w ./packages/twrl run build
```

Preview the tarball:

```
npm -w ./packages/twrl pack
```

Publish the package:

```
npm -w ./packages/twrl publish
```

Commit the version bump.
