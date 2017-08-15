'use strict';

const JiraApi = require( 'jira' ).JiraApi,
	url = require( 'url' ),
	util = require( 'util' ),
	log = require( 'winston' );

const JiraTicket = function ( config ) {
	log.info( 'Creating new JiraTicket instance' );
	//TODO: check parameters
	this.config = config;
	this.jira = new JiraApi( config.protocol, config.host, config.port, config.user, config.password, '2', false, false );
};

JiraTicket.prototype.get = function ( issueKey, callback ) {
	let self = this,
		ticketData;

	log.info( `Requesting info for issue ${issueKey}` );

	self.jira.findIssue( issueKey, function ( error, issue ) {
		if ( error ) {
			log.error( `Jira API error: ${error}` );
			callback( error );
			return;
		}

		log.info( `Issue ${issue.key} found in Jira` );

		ticketData = {
			summary: issue.fields.summary,
			status : issue.fields.status.name,
			key    : issue.key,
			url    : url.format( {
				protocol: self.config.protocol,
				hostname: self.config.host,
				port: self.config.port,
				pathname: 'browse/' + issue.key
			} )
		};

		log.debug( 'Issue summary: %s', ticketData.summary );
		log.debug( 'Issue status: %s', ticketData.status );
		log.debug( 'Issue URL: %s', ticketData.url );

		callback( error, ticketData ); // TODO: check if it function
	} );
};

module.exports = JiraTicket;
