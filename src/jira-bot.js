'use strict';

const { RTMClient } = require('@slack/rtm-api');
const { WebClient } = require('@slack/web-api');
const EventEmitter = require('events').EventEmitter;
const log = require('winston');

class JiraBot extends EventEmitter {
  constructor(config) {
    super();

    log.debug('Creating new JiraBot instance');

    this.config = config;

    this._generateChannelsRegexes();

    this.rtmApi = new RTMClient(config.apiKey);
    this.webApi = new WebClient(config.apiKey);
  }

  async login() {
    const rtmInfo = await this.rtmApi.start();
    this._onOpen(rtmInfo);

    this.rtmApi.on('message', this._onMessage.bind(this));
  }

  sendTyping(...args) {
    return this.rtmApi.sendTyping.apply(this.rtmApi, args);
  }

  async replyToMessage(message, replyBody) {
    await this.webApi.chat.postMessage({
      channel: message.channel,
      thread_ts: message.thread_ts,
      text: replyBody,
      as_user: true,
    });
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

  async _onMessage(message) {
    if (this._isSelfMessage(message) || message.text == null || !message.user) {
      return;
    }

    const channel = await this._getChannelById(message.channel);
    log.debug(`Received message "${message.text}" from channel "${channel.name}"`);

    await this._respondToHello(message);

    const user = await this._getUserById(message.user);
    const issueKeys = await this._getIssueKeysFromMessage(message);

    issueKeys.forEach((issueKey) => {
      log.info(`Found Jira issue key ${issueKey} in channel #${channel.name} from user @${user.name}`);

      this.emit('issueKeyFound', issueKey, channel, message);
    });
  }

  _isSelfMessage(message) {
    return message.user === this.rtmApi.activeUserId;
  }

  async _getIssueKeysFromMessage(message) {
    const channel = await this._getChannelById(message.channel);
    const issuesRegex = this._channelsRegexes[channel.name];

    // checking if it's a message from the configured channel
    if (!issuesRegex) {
      log.debug(`Regex for channel "${channel.name}" is not found`);
      return [];
    }

    const matchedIssueKeys = message.text.match(issuesRegex) ?? [];

    // Return only unique issue keys
    return Array.from(new Set(matchedIssueKeys));
  }

  async _respondToHello(message) {
    if (message.text.match(/hello/i) && (message.text.search(`<@${this.rtmApi.activeUserId}>`) !== -1)) {
      const user = await this._getUserById(message.user);

      await this.replyToMessage(message, `Hello @${user.name}!`);
    }
  }

  async _getUserById(userId) {
    const response = await this.webApi.users.info({user: userId});
    return response.user;
  }

  async _getChannelById(channelId) {
    const response = await this.webApi.conversations.info({channel: channelId});
    return response.channel;
  }
}

module.exports = JiraBot;
