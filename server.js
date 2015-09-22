'use strict';

const config = require( './config' ),
	JiraTicket = require( './jira-ticket' ),
	JiraBot = require( './jira-bot' ),
	util = require( 'util' );

const onTicketFound = function ( key, channel ) {
	jiraTicket.get( key, function ( error, ticket ) {
		if ( error ) {
			console.error( error );
			return;
		}

		let message = util.format( '*%s*\n>%s\n>Status: %s\n>%s', ticket.key, ticket.summary, ticket.status, ticket.url );
		channel.send( message );
	} );
};

let jiraTicket = new JiraTicket( config.jira ),
	jiraBot = new JiraBot( config.slack );

jiraBot.on( 'ticketKeyFound', onTicketFound );

jiraBot.login();
