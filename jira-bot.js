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

    this._generateChannelsRegexes();

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

  _generateChannelsRegexes() {
    this._channelsRegexes = Object.getOwnPropertyNames(this.config.channelsConfig).reduce((regexes, channelName) => {
      const channelIssueKeys = this.config.channelsConfig[channelName];
      const channelRegex = new RegExp(`(${channelIssueKeys.join('|')})-\\d+`, 'g');

      regexes[channelName] = channelRegex;

      log.debug(`Adding regex "${channelRegex}" for channel "${channelName}"`);

      return regexes;
    }, {});
  }

  _onOpen(rtmStartData) {
    log.info(`Connected to Slack. You are @${rtmStartData.self.name} of "${rtmStartData.team.name}" team`);
  }

  _onMessage(message) {
    const channel = this._getChannelById(message.channel);
    const user = this.slack.dataStore.getUserById(message.user);

    if (this._isSelfMessage(message) || message.text == null) {
      return;
    }

    log.debug(`Received message "${message.text}" from channel "${channel.name}"`);

    this._respondToHello(message);

    this._getIssueKeysFromMessage(message).forEach((issueKey) => {
      log.info(`Found Jira issue key ${issueKey} in channel #${channel.name} from user @${user.name}`);

      this.emit('issueKeyFound', issueKey, channel);
    });
  }

  _isSelfMessage(message) {
    return message.user === this.slack.activeUserId;
  }

  _getIssueKeysFromMessage(message) {
    const channel = this._getChannelById(message.channel);
    const issuesRegex = this._channelsRegexes[channel.name];

    // checking if it's a message from the configured channel
    if (!issuesRegex) {
      log.debug(`Regex for channel "${channel.name}" is not found`);
      return [];
    }

    return _.uniq(message.text.match(issuesRegex) || []);
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
