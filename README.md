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
- **JIRA_ISSUES_PREFIXES** - array with Jira issue key prefixes to watch in messages (for example JIRA for issue keys like JIRA-1) (required)
- **JIRA_STRICT_SSL** - whether to check SSL certificate of Jira server. Default: `true`. Set to `false` if you have self-signed certificate. 
- **SLACK_API_KEY** - api token for your bot (required)
- **SLACK_ALLOWED_CHANNELS** - array with allowed channels to watch for issue keys (required)