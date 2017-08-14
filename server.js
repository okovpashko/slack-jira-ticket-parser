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
    jiraBot.sendMessage(message, channel.id);
  });
});

jiraBot.login();
