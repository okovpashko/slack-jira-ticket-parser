# slack-jira-ticket-parser
Slack bot for parsing Jira issues mentioning in messages and displaying its info in chat.

## Installation
- create new bot integration in Slack as described [here](https://api.slack.com/bot-users)
- invite this bot into channel(s) where you want to get info about Jira issues
- install [node.js](https://nodejs.org/)
- inside projects directory run `npm install` command
- start bot `node server.js`

## Configuraion options
All described settings are contained in config.js file.
### jira
- **host** - Jira server hostname
- **protocol** - Jira server protocol (http or https)
- **port** - Jira server port (by default 80 for http and 443 for https)
- **user** - Jira username
- **password** - Jira password

### slack
- **apiToken** - api token for your bot
- **watchTicketPrefixes** - array with Jira issue key prefixes to watch in messages (for example JIRA for issue keys like JIRA-1)
- **allowChannels** - array with allowed channels to watch for issue keys
- **autoReconnect** - auto reconnect to Slack after losing connection (must be true)
- **autoMark** - auto update read message pointer for bot (must be true)