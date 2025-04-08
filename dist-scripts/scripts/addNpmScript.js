"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var addNpmScript = function () {
    console.log('=========================================');
    console.log('IMPORTANT: Manual action required');
    console.log('=========================================');
    console.log('Please manually add the following script to your package.json file:');
    console.log('"create-admin": "ts-node scripts/createAdminUser.ts"');
    console.log('');
    console.log('This will allow you to run "npm run create-admin" to create an admin user.');
    console.log('=========================================');
};
addNpmScript();
