# slack-jira-ticket-parser
Slack bot for parsing Jira issues mentioning in messages and displaying its info in chat.

## Installation
- create new bot integration in Slack as described [here](https://api.slack.com/bot-users)
- invite this bot into channel(s) where you want to get info about Jira issues
- install [node.js](https://nodejs.org/)
- inside projects directory run `npm install` command
- start bot `node server.js`

## Configuraion options
All options can be passed via ENV variables
 
- **JIRA_URL** - Jira server url (required)
- **JIRA_USER** - Jira username (required)
- **JIRA_PASSWORD** - Jira password (required)
- **JIRA_STRICT_SSL** - whether to check SSL certificate of Jira server. Default: `true`. Set to `false` if you have self-signed certificate
- **SLACK_API_KEY** - api token for your bot (required)
- **CHANNELS_CONFIG** - a JSON serialized object with channel name as a key and array with issue keys as a value. For example `{"my-channel": ["FOO", "BAR"]}`
- **LOG_LEVEL** - log level supported by [winston](https://github.com/winstonjs/winston#logging-levels)