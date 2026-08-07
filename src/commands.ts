import { setUser, readConfig } from "./config"

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;


export async function handlerLogin (_cmdName: string, ...args: string[]): Promise<void> {
  if (args.length === 0) {
    throw new Error("Missing argument, username is required");
  }
  const currentConfig = readConfig();
  setUser(currentConfig, args[0]);
  console.log(`Current user has been set to ${args[0]}`);
}

export async function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler): Promise<void> {
  registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]): Promise<void> {
  const commandHandler = registry[cmdName];
  if (!commandHandler) {
    throw new Error(`Unknown command: ${cmdName}`);
  }
  await commandHandler(cmdName, ...args);
}