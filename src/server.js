'use strict';

const defaultConfig = require('./default-config');
const JiraClient = require('./jira-client');
const JiraBot = require('./jira-bot');
const log = require('winston');
const deepMerge = require('deepmerge');

class Server {
  constructor(config) {
    this._config = deepMerge(defaultConfig, config);
    log.level = this._config.logLevel;

    this._jiraClient = new JiraClient(this._config.jira);
    this._jiraBot = new JiraBot(this._config.slack);

    this._jiraBot.on('issueKeyFound', this._onIssueKeyFound.bind(this));
  }

  start() {
    this._jiraClient.connect();
    this._jiraBot.login();
  }

  _onIssueKeyFound(issueKey, channel) {
    this._jiraBot.sendTyping(channel.id);

    this._jiraClient.findIssue(issueKey, (error, issueData) => {
      if (error) {
        return;
      }

      const message = `>*${issueData.key}*\n>${issueData.summary}\n>Status: ${issueData.status}\n>${issueData.url}`;
      this._jiraBot.sendMessage(message, channel.id, (error) => {
        if (error) {
          log.error('Error while posting issue info to Slack', error);
          return;
        }

        log.info(`Posted Jira ${issueData.key} info to channel #${channel.name}`);
      });
    });
  }
}

module.exports = Server;