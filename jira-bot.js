'use strict';

const Slack = require( 'slack-client' ),
	EventEmitter = require( 'events' ).EventEmitter,
	util = require( 'util' );

const JiraBot = function ( config ) { // TODO: check config
	let self = this;
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
	console.log( "Welcome to Slack. You are @" + this.slack.self.name + " of " + this.slack.team.name ); // TODO: log info
};

JiraBot.prototype._onMessage = function ( message ) {
	let self = this,
		slack = self.slack,
		user = slack.getUserByID( message.user ),
		channel = slack.getChannelGroupOrDMByID( message.channel ),
		text = message.text,
		issueKeys;

	if ( message.type !== 'message' || user === slack.self.name || !text || self.config.allowChannels.indexOf( channel.name ) === -1 ) {
		return;
	}

	if ( text.match( /hello/i ) && (text.search( '<@' + slack.self.id + '>' ) !== -1) ) {
		channel.send( util.format( '@%s hello :)', user.name ) );
	}

	issueKeys = text.match( self.issueKeysRegex ) || [];

	if ( issueKeys.length ) {
		issueKeys.forEach( function ( issueKey ) {
			console.log( 'Found jira ticket %s in message from user %s', issueKey, user.name ); // LOG info

			self.emit( 'ticketKeyFound', issueKey, channel );
		} );
	}
};

JiraBot.prototype._onError = function ( error ) {
	console.error( "Error: " + error );
	this.emit( 'error', error );
};

module.exports = JiraBot;
