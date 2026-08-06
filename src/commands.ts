import { setUser, readConfig } from "./config"

export type CommandHandler = (cmdName: string, ...args: string[]) => void;
export type CommandsRegistry = Record<string, CommandHandler>;


export function handlerLogin (_cmdName: string, ...args: string[]): void {
  if (args.length === 0) {
    throw new Error("Missing argument, username is required");
  }
  const currentConfig = readConfig();
  setUser(currentConfig, args[0]);
  console.log(`Current user has been set to ${args[0]}`);
}

export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler): void {
  registry[cmdName] = handler;
}

export function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]): void {
  const commandHandler = registry[cmdName];
  if (!commandHandler) {
    throw new Error(`Unknown command: ${cmdName}`);
  }
  commandHandler(cmdName, ...args);
}