import dotenv from 'dotenv';
dotenv.config();
import { checkEnv } from './lib/utils';
checkEnv();
import { ensureDirSync, ensureFileSync } from 'fs-extra';

ensureDirSync('/tmp/poglis')
ensureDirSync('./logs')
ensureFileSync('./logs/workers.log')
ensureDirSync('./hooks');

import app from './lib/router'

app.listen(process.env.PORT, () => {
    console.log(`poglis is listening on port ${process.env.PORT}`);
});