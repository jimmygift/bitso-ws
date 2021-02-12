// First define these env vars on the .env file: 
// IFXDB_TOKEN, IFXDB_ORG, IFXDB_BUCKET, IFXDB_URL 

const dotenv = require('dotenv');

dotenv.config();

if ( ! process.env.IFXDB_TOKEN ) {
    console.log('IFXDB_TOKEN not defined. You can generate a Token from the "Tokens Tab" in the UI');
    process.exit()
} else if ( ! process.env.IFXDB_ORG ) {
    console.log('IFXDB_ORG not defined.');
    process.exit()
} else if ( ! process.env.IFXDB_BUCKET) {
    console.log('IFXDB_BUCKET not defined.');
    process.exit()
} else if ( ! process.env.IFXDB_URL) {
    console.log('IFXDB_URL not defined.');
    process.exit()
}

module.exports = {
  ifxdb_token:  process.env.IFXDB_TOKEN,
  ifxdb_org:    process.env.IFXDB_ORG,
  ifxdb_bucket: process.env.IFXDB_BUCKET,
  ifxdb_url:    process.env.IFXDB_URL 
};