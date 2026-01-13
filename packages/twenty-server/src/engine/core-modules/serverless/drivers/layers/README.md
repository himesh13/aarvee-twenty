# Serverless Layers Directory

This directory contains package definitions for AWS Lambda layers used by the serverless functions.

## Important Notes

- **DO NOT** run `yarn install` in this directory during development or build
- The `node_modules/` directory should NOT exist in this location during the build process
- Dependencies are meant to be installed during deployment/runtime, not during the application build

## Why?

The NestJS build process with SWC compiler scans all JavaScript files in the `src/` directory. If `node_modules/` exists here, SWC will attempt to compile test files and other JavaScript files from dependencies. This causes build failures because SWC's ES module parser does not accept top-level return statements that are valid in CommonJS test files (e.g., files in `node_modules/has-symbols/test/`).

## Build Process

During the build:
1. Only `package.json` and `yarn.lock` files are copied to the dist directory as assets
2. The actual `node_modules/` installation happens during deployment/Lambda layer creation
3. A `.gitignore` file in each layer directory (e.g., `layers/1/.gitignore`) ensures `node_modules/` is never committed to the repository

## Deployment

The dependencies defined in `package.json` are installed as part of the Lambda layer deployment process, not during the application build.
