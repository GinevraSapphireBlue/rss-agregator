export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;

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
