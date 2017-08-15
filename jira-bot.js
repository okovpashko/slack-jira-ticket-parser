'use strict';

const Slack = require( 'slack-client' ),
	EventEmitter = require( 'events' ).EventEmitter,
	util = require( 'util' ),
	log = require( 'winston' ),
	_ = require( 'lodash' );

const JiraBot = function ( config ) { // TODO: check config
	let self = this;

	log.info( 'Creating new JiraBot instance' );

	self.config = config;
	EventEmitter.call( self );

	self.issueKeysRegex = new RegExp( '(' + config.watchTicketPrefixes.join( '|' ) + ')-\\d+', 'g' );

	self.slack = new Slack( config.apiToken, config.autoReconnect, config.autoMark );

	this.slack.on( 'open', self._onOpen.bind( self ) );
	this.slack.on( 'message', self._onMessage.bind( self ) );
	this.slack.on( 'error', self._onError.bind( self ) );
};

util.inherits( JiraBot, EventEmitter );

JiraBot.prototype.login = function () {
	this.slack.login();
};

JiraBot.prototype._onOpen = function () {
	log.info( `Connected to Slack. You are @${this.slack.self.name} of ${this.slack.team.name} team` );
};

JiraBot.prototype._onMessage = function ( message ) {
	let self = this,
		slack = self.slack,
		user = slack.getUserByID( message.user ),
		channel = slack.getChannelGroupOrDMByID( message.channel ),
		text = message.text,
		issueKeys;

	if ( message.type !== 'message' || user.id === slack.self.id || !text || self.config.allowChannels.indexOf( channel.name ) === -1 ) {
		return;
	}

	if ( text.match( /hello/i ) && (text.search( '<@' + slack.self.id + '>' ) !== -1) ) {
		channel.send( `@${user.name} hello :)` );
	}

	issueKeys = text.match( self.issueKeysRegex ).reverse() || [];

	if ( issueKeys.length ) {
		_.uniq( issueKeys ).forEach( function ( issueKey ) {
			log.info( `Found Jira issue key ${issueKey} in channel #${channel.name} from user @${ user.name}` );
			self.emit( 'ticketKeyFound', issueKey, channel );
		} );
	}
};

JiraBot.prototype._onError = function ( error ) {
	log.error( `Slack bot error: ${util.inspect( error )}` );
	this.emit( 'error', error );
};

module.exports = JiraBot;
