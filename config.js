module.exports = {
  jira: {
    url: process.env.JIRA_URL, // TODO: support custom/ports
    user: process.env.JIRA_USER,
    password: process.env.JIRA_PASSWORD,
    strictSSL: JSON.parse(process.env.JIRA_STRICT_SSL || true)
  },
  slack: {
    apiKey: process.env.SLACK_API_KEY,
    channelsConfig: JSON.parse(process.env.CHANNELS_CONFIG || '{}')
  },
};
