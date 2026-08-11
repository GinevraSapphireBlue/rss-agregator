# RSS Aggregator

## Description
CLI Application written in TypeScript, using PostgreSQL to store data.
Application gives ability for multiple users to aggragate RSS feeds. Feeds are downloaded once and accessed by multiple users, according to their subscriptions.

## Requirements
Requires PostgreSQL database to be installed and running with a database created for the application and defined in configuration file.

## Installation
1. npm run generate - creates database tables
2. npm run start <cmdName> <arguments> - runs application, specifically the selected command

## Configuration
Requires "gatorconfig.json" file to be present in the home directory:
```text
{
  dbUrl: <database_url>,
  currentUserName: null
}
```

## Usage
npm run start <cmdName> <arguments>

## Commands
- `register <username>` - register new user with _username_
- `login <username>` - login as user with _username_
- `reset` - remove all users from the database
- `users` - list all users in the database
- `addfeed <name> <url>` - add new feed with _name_ and _url_ to the database (requires user to be logged in)
- `feeds` - list all feeds in the database
- `follow <url>` - follow feed with _url_ (requires user to be logged in)
- `unfollow <url>` - unfollow feed with _url_ (requires user to be logged in)
- `following` - list all feeds followed by the logged in user (requires user to be logged in)
- `agg <timeBetweenReqs>` - aggregate all feeds and store posts in the database, fetch next feed after _timeBetweenReqs_ (format: 50s, 5m, 1h)
- `browse <maxPosts>` - browse posts from feeds followed by the logged in user (requires user to be logged in), default value of maxPosts = 2

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.
