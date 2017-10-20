'use strict';

const JiraApi = require('jira').JiraApi,
  url = require('url'),
  util = require('util'),
  log = require('winston');

class JiraClient {
  constructor(config) {
    log.debug('Creating new JiraClient instance');
    //TODO: check parameters
    this.config = config;
  };

  connect() {
    log.debug(`Connecting to Jira at ${this.config.url}`);

    const parsedUrl = url.parse(this.config.url);
    const API_VERSION = '2';

    this.jira = new JiraApi(
      parsedUrl.protocol,
      parsedUrl.hostname,
      parsedUrl.port,
      this.config.user,
      this.config.password,
      API_VERSION,
      Boolean(process.env.DEBUG),
      this.config.strictSSL,
    );
  }

  findIssue(issueKey, callback) {
    log.info(`Requesting info for issue ${issueKey}`);

    this.jira.findIssue(issueKey, (error, issue) => {
      if (error) {
        log.error(`Jira API error: ${error}`);
        callback(error);
        return;
      }

      log.info(`Issue ${issue.key} found in Jira`);

      const issueData = {
        summary: issue.fields.summary,
        status: issue.fields.status.name,
        key: issue.key,
        url: url.resolve(this.config.url, `browse/${issue.key}`)
      };

      log.debug('Issue summary: %s', issueData.summary);
      log.debug('Issue status: %s', issueData.status);
      log.debug('Issue URL: %s', issueData.url);

      callback(error, issueData);
    });
  }
}

module.exports = JiraClient;
