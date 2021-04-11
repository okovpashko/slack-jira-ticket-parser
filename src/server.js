'use strict';

const defaultConfig = require('./default-config');
const JiraClient = require('./jira-client');
const JiraBot = require('./jira-bot');
const logger = require('winston');
const deepMerge = require('deepmerge');
const configureLogger = require('./logger');

class Server {
  constructor(config) {
    this._config = deepMerge(defaultConfig, config);

    configureLogger({level: this._config.logLevel});

    this._jiraClient = new JiraClient(this._config.jira);
    this._jiraBot = new JiraBot(this._config.slack);

    this._jiraBot.on('issueKeyFound', this._onIssueKeyFound.bind(this));
  }

  async start() {
    this._jiraClient.connect();
    await this._jiraBot.login();
  }

  async _onIssueKeyFound(issueKey, channel, message) {
    await this._jiraBot.sendTyping(channel.id);

    this._jiraClient.findIssue(issueKey, async (error, issueData) => {
      if (error) {
        return;
      }

      const replyBody = `>*${issueData.key}*\n>${issueData.summary}\n>Status: ${issueData.status}\n>${issueData.url}`;

      try {
        await this._jiraBot.replyToMessage(message, replyBody);
        logger.info(`Posted Jira ${issueData.key} info to channel #${channel.name}`);
      } catch (error) {
        logger.error('Error while posting issue info to Slack', error);
      }
    });
  }
}

module.exports = Server;
