# slack-jira-ticket-parser
Slack bot for parsing Jira issues mentioning in messages and displaying its info in chat.

## Installation 

#### Via NPM
```
npm install jira-slack-boot
```
#### or via Yarn
```
yarn add jira-slack-boot
```

## Usage
1. Create new bot integration in Slack as described [here](https://api.slack.com/bot-users)
2. Invite this bot into channel(s) where you want to get info about Jira issues
3. Create js file (e.g. index.js) with the following content
```javascript
'use strict';
const Server = require('jira-slack-bot');
const server = new Server({
  jira: {
    url: 'https://example.com',
    user: 'john',
    password: 'password',
    strictSSL: false,
  },
  slack: {
    apiKey: 'your slack api key',
    channelsConfig: {
      'channel name': ['project key']
    }
  },
  logLevel: 'info'
});

server.start();
```
4. Start your bot
```bash
node index.js
```

## Configuration options 
- **jira.url** - Jira server url (required)
- **jira.user** - Jira username (required)
- **jira.password** - Jira password (required)
- **jira.strictSSL** - whether to check SSL certificate of Jira server. Default: `true`. Set to `false` if you have self-signed certificate
- **slack.apiKey** - api token for your bot (required)
- **slack.channelsConfig** - object with a channel name as a key and an array with issue keys as a value.
- **logLevel** - log level supported by [winston](https://github.com/winstonjs/winston#logging-levels)