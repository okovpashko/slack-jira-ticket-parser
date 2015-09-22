'use strict';

const JiraApi = require( 'jira' ).JiraApi,
	url = require( 'url' ),
	util = require( 'util' );

const JiraTicket = function ( config ) {
	//TODO: check parameters
	this.config = config;
	this.jira = new JiraApi( config.protocol, config.host, config.port, config.user, config.password, '2', false, false );
};

JiraTicket.prototype.get = function ( issueKey, callback ) {
	let self = this,
		ticketData;

	self.jira.findIssue( issueKey, function ( error, issue ) {
		if ( error ) {
			console.error( error );
			callback( error );
			return;
		}

		ticketData = {
			summary: issue.fields.summary,
			status : issue.fields.status.name,
			key    : issue.key,
			url    : url.format( {
				protocol: self.config.protocol,
				hostname: self.config.host,
				pathname: 'browse/' + issue.key
			} )
		};

		//TODO: refactor to use logger
		console.log( 'Issue summary: %s', ticketData.summary );
		console.log( 'Issue status: %s', ticketData.status );
		console.log( 'Issue URL: %s', ticketData.url );

		callback( error, ticketData ); // TODO: check if it function
	} );
};

module.exports = JiraTicket;
