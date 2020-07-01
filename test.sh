#/bin/bash

npm run build
npm run createdb
npm run run&
npx mocha -r ts-node/register ts/tests.ts
rm main_db.sqlite
rm sessions.sqlite