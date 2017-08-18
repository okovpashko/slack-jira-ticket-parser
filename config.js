module.exports = {
  jira: {
    url: process.env.JIRA_URL, // TODO: support custom/ports
    user: process.env.JIRA_USER,
    password: process.env.JIRA_PASSWORD,
    strictSSL: JSON.parse(process.env.JIRA_STRICT_SSL || true)
  },
  slack: {
    apiKey: process.env.SLACK_API_KEY,
    watchTicketPrefixes: JSON.parse(process.env.JIRA_ISSUES_PREFIXES || '[]'),
    allowChannels: JSON.parse(process.env.SLACK_ALLOWED_CHANNELS || '[]')
  }
};
