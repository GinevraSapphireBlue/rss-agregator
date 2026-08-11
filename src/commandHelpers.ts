import { CommandHandler } from "./comandRegistry";
import { readConfig } from "./config";
import { getUser } from "./lib/db/queries_users";
import { User } from "./lib/db/schema";

export type UserCommandHandler = (cmdName: string, user: User, ...args: string[]) => Promise<void>;

export async function getCurrentUserDbRecord(): Promise<User> {
  const currentUser = readConfig().currentUserName;
  if (!currentUser) throw new Error("No user logged in");
  
  const currentUserDb = await getUser(currentUser);
  if (!currentUserDb) throw new Error("User could not be found");

  return currentUserDb;
}

export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
  return async (_cmdName: string, ...args: string[]): Promise<void> => {
    const user = await getCurrentUserDbRecord();
    await handler(_cmdName, user, ...args);
  };
}

