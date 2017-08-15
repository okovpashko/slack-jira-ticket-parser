'use strict';

const RtmClient = require('@slack/client').RtmClient,
  CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS,
  RTM_EVENTS = require('@slack/client').RTM_EVENTS,
  MemoryDataStore = require('@slack/client').MemoryDataStore,
  EventEmitter = require('events').EventEmitter,
  util = require('util'),
  log = require('winston'),
  _ = require('lodash');

class JiraBot extends EventEmitter {
  constructor(config) {
    super();

    log.info('Creating new JiraBot instance');

    this.config = config;

    this.issueKeysRegex = new RegExp('(' + config.watchTicketPrefixes.join('|') + ')-\\d+', 'g');

    this.slack = new RtmClient(config.apiToken, {
      dataStore: new MemoryDataStore()
    });

    this.slack.on(CLIENT_EVENTS.RTM.AUTHENTICATED, this._onOpen.bind(this));
    this.slack.on(RTM_EVENTS.MESSAGE, this._onMessage.bind(this));
  }

  login() {
    this.slack.start();
  }

  sendMessage(...args) {
    this.slack.sendMessage.apply(this.slack, args);
  }

  sendTyping(...args) {
    this.slack.sendTyping.apply(this.slack, args);
  }

  _onOpen(rtmStartData) {
    log.info(`Connected to Slack. You are @${rtmStartData.self.name} of "${rtmStartData.team.name}" team`);
  }

  _onMessage(message) {
    const text = message.text;

    const channel = this.slack.dataStore.getGroupById(message.channel);
    const user = this.slack.dataStore.getUserById(message.user);
    let issueKeys;

    if (message.type !== 'message'
      || message.user === this.slack.activeUserId
      || !text
      || this.config.allowChannels.indexOf(channel.name) === -1) {
      return;
    }

    if (text.match(/hello/i) && (text.search(`<@${this.slack.activeUserId}>`) !== -1)) {
      this.slack.sendMessage(`@${user.name} hello :)`, message.channel);
    }

    issueKeys = text.match(this.issueKeysRegex).reverse() || [];

    if (issueKeys.length) {
      _.uniq(issueKeys).forEach((issueKey) => {
        log.info(`Found Jira issue key ${issueKey} in channel #${channel.name} from user @${user.name}`);

        this.emit('ticketKeyFound', issueKey, channel);
      });
    }
  }
}

module.exports = JiraBot;
