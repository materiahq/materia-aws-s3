# Materia - AWS S3

Use your AWS S3 account in your materia applications to upload and retrieve files. This addon uses the `aws-sdk` package under the hood.

## Prerequisites

You need a AWS account to use this addon.

## Features

- AWS S3 Buckets management: list/create/delete/listObject/deleteObject,
- AWS S3 endpoints management: add interactively upload, fetch and delete endpoints.

## Installation from NPM

In your Materia application, run `npm install @materia/aws-s3 --save` or `yarn add @materia/aws-s3`.

Materia Designer will automatically restart.

## Installation from local files

Clone this repository:

```
git clone git@github.com:materiahq/materia-aws-s3.git
cd materia-aws-s3
```

Then install dependencies and build:

```
yarn
yarn build
```

To test your addon locally before publishing it to NPM, use `npm link`:

```
cd dist && npm link
```

and in your materia application

```
npm link @materia/aws-s3
```

then add `"@materia/aws-s3"` in the links array of the materia.json configuration file - it will let Materia knows of the existance of the addon.
