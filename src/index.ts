import type { CommandsRegistry } from "./commands"
import { registerCommand, runCommand, handlerLogin, handlerRegister, handlerReset } from "./commands";
import { argv, exit } from "node:process";

async function main() {
  const cmdRegistry: CommandsRegistry = {};
  await registerCommand(cmdRegistry, "login", handlerLogin);
  await registerCommand(cmdRegistry, "register", handlerRegister);
  await registerCommand(cmdRegistry, "reset", handlerReset);

  if (argv.length < 3) {
    console.log("Missing required argument, no command name provided");
    process.exitCode = 1;
    exit();
  }
  const [cmdName, ...cmdArgs] = argv.slice(2);
  
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

