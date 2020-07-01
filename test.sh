#/bin/bash

npm run build
npm run createdb
npm run run&
npx mocha -r ts-node/register ts/tests.ts
kill %%
rm main_db.sqlite
rm sessions.sqlite