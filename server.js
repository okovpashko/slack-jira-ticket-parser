'use strict';

const config = require( './config' ),
	JiraTicket = require( './jira-ticket' ),
	JiraBot = require( './jira-bot' ),
	log = require( 'winston' );

const onTicketFound = function ( key, channel ) {
	jiraTicket.get( key, function ( error, ticket ) {
		if ( error ) {
			return;
		}

		channel.send( `>*${ticket.key}*\n>${ticket.summary}\n>Status: ${ticket.status}\n>${ticket.url}` );
	} );
};

let jiraTicket = new JiraTicket( config.jira ),
	jiraBot = new JiraBot( config.slack );

jiraBot.on( 'ticketKeyFound', onTicketFound );

jiraBot.login();
