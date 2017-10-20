'use strict';

const config = require('./config');
const JiraClient = require('./jira-client');
const JiraBot = require('./jira-bot');
const log = require('winston');

log.level = config.logLevel;

const jiraClient = new JiraClient(config.jira);
const jiraBot = new JiraBot(config.slack);

jiraBot.on('issueKeyFound', (key, channel) => {
  jiraBot.sendTyping(channel.id);

  jiraClient.findIssue(key, function(error, issueData) {
    if (error) {
      return;
    }

    const message = `>*${issueData.key}*\n>${issueData.summary}\n>Status: ${issueData.status}\n>${issueData.url}`;
    jiraBot.sendMessage(message, channel.id, (error) => {
      if (error) {
        log.error('Error while posting issue info to Slack', error);
        return;
      }

      log.info(`Posted Jira ${issueData.key} info to channel #${channel.name}`);
    });
  });
});

jiraClient.connect();
jiraBot.login();
