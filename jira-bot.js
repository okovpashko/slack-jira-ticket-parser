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

    log.debug('Creating new JiraBot instance');

    this.config = config;

    this.issueKeysRegex = new RegExp('(' + config.watchTicketPrefixes.join('|') + ')-\\d+', 'g');

    this.slack = new RtmClient(config.apiKey, {
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
    const channel = this._getChannelById(message.channel);
    const user = this.slack.dataStore.getUserById(message.user);

    if (this._isSelfMessage(message) || !this._isMessageFromAllowedChannel(message) || message.text == null) {
      return;
    }

    this._respondToHello(message);

    this._getIssueKeysFromMessage(message).forEach((issueKey) => {
      log.info(`Found Jira issue key ${issueKey} in channel #${channel.name} from user @${user.name}`);

      this.emit('issueKeyFound', issueKey, channel);
    });
  }

  _isSelfMessage(message) {
    return message.user === this.slack.activeUserId;
  }

  _isMessageFromAllowedChannel(message) {
    const channel = this._getChannelById(message.channel);
    return this.config.allowChannels.indexOf(channel.name) !== -1;
  }

  _getIssueKeysFromMessage(message) {
    return _.uniq(message.text.match(this.issueKeysRegex) || []);
  }

  _respondToHello(message) {
    if (message.text.match(/hello/i) && (message.text.search(`<@${this.slack.activeUserId}>`) !== -1)) {
      const user = this.slack.dataStore.getUserById(message.user);
      this.slack.sendMessage(`Hello @${user.name}!`, message.channel);
    }
  }

  _getChannelById(channelId) {
    const dataStore = this.slack.dataStore;
    return dataStore.getGroupById(channelId) || dataStore.getChannelById(channelId);
  }
}

module.exports = JiraBot;
