import type { CommandsRegistry } from "./commands"
import { registerCommand, handlerLogin, runCommand } from "./commands";
import { argv, exit } from "node:process";

function main() {
  const cmdRegistry: CommandsRegistry = {};
  registerCommand(cmdRegistry, "login", handlerLogin);

  if (argv.length < 3) {
    console.log("Missing required argument, no command name provided");
    process.exitCode = 1;
    exit();
  }
  const [cmdName, ...cmdArgs] = argv.slice(2);
  
  try {
    runCommand(cmdRegistry, cmdName, ...cmdArgs);
  }
  catch (ex) {
    const error = ex as Error;
    console.log(error.message);
    process.exitCode = 1;
    exit();
  }
}

main();

