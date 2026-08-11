import { argv, exit } from "node:process";

import { registerCommand, runCommand } from "./comandRegistry";
import { handlerLogin, handlerRegister, handlerReset, handlerAllUsers } from "./commandsUsers";
import { handlerAggregateFeed, handlerAddFeed, handlerListFeeds } from "./commandsFeeds";
import { handlerAllFollowingFeeds, handlerFollowFeed, handlerUnfollowFeed } from "./commandsFeedFollows";
import { middlewareLoggedIn } from "./commandHelpers";

import type { CommandsRegistry } from "./comandRegistry";

async function main() {
  if (argv.length < 3) {
    console.log("Missing required argument, no command name provided");
    process.exitCode = 1;
    exit();
  }
  const [cmdName, ...cmdArgs] = argv.slice(2);

  const cmdRegistry: CommandsRegistry = {};
  await registerAllCommands(cmdRegistry);


  try {
    await runCommand(cmdRegistry, cmdName, ...cmdArgs);
  }
  catch (ex) {
    const error = ex as Error;
    console.log(error.message);
    process.exitCode = 1;
    exit();
  }
  exit(0);
}

await main();

async function registerAllCommands(cmdRegistry: CommandsRegistry): Promise<void> {
  await Promise.all([
    registerCommand(cmdRegistry, "login", handlerLogin),
    registerCommand(cmdRegistry, "register", handlerRegister),
    registerCommand(cmdRegistry, "reset", handlerReset),
    registerCommand(cmdRegistry, "users", handlerAllUsers),
    registerCommand(cmdRegistry, "agg", handlerAggregateFeed),
    registerCommand(cmdRegistry, "addfeed", middlewareLoggedIn(handlerAddFeed)),
    registerCommand(cmdRegistry, "feeds", handlerListFeeds),
    registerCommand(cmdRegistry, "follow", middlewareLoggedIn(handlerFollowFeed)),
    registerCommand(cmdRegistry, "following", middlewareLoggedIn(handlerAllFollowingFeeds)),
    registerCommand(cmdRegistry, "unfollow", middlewareLoggedIn(handlerUnfollowFeed)),
  ])
}