'use strict';

const config = require('./config');
const JiraTicket = require('./jira-ticket');
const JiraBot = require('./jira-bot');
const log = require('winston');

let jiraTicket = new JiraTicket(config.jira),
  jiraBot = new JiraBot(config.slack);

jiraBot.on('ticketKeyFound', (key, channel) => {
  jiraTicket.get(key, function(error, ticket) {
    if (error) {
      return;
    }

    const message = `>*${ticket.key}*\n>${ticket.summary}\n>Status: ${ticket.status}\n>${ticket.url}`;
    jiraBot.sendMessage(message, channel.id, (error) => {
      if(error) {
        log.error('Error while posting issue info to Slack', error);
        return;
      }

      log.info(`Posted Jira issue info to channel #${channel.name}`);
    });
  });
});

jiraBot.login();
