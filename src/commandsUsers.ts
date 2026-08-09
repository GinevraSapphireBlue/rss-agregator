import { setUser, readConfig } from "./config"
import { createUser, getUser, deleteAllUsers, getAllUsers } from "./lib/db/queries_users";

import type { CommandHandler } from "./comandRegistry";

export async function handlerLogin (_cmdName: string, ...args: string[]): Promise<void> {
  if (args.length === 0) {
    throw new Error("Missing argument, username is required");
  }
  const name = args[0];

  if (await getUser(name) === undefined) {
    throw new Error("Cannot log in. User doesn't exist.");
  }

  const currentConfig = readConfig();
  setUser(currentConfig, args[0]);
  console.log(`Current user has been set to ${args[0]}`);
}

export async function handlerRegister(_cmdName: string, ...args: string[]): Promise<void> {
  if (args.length === 0) {
    throw new Error("Missing argument, username is required");
  }
  const name = args[0];
  if (await getUser(name) !== undefined) {
    throw new Error("Cannot create user. User already exists");
  }
  const newUser = await createUser(name);
  if (newUser === undefined) {
    throw new Error("User creation failed");
  }
  setUser(readConfig(), name);
  console.log(`User ${name} was created`);
  console.log(newUser);
}

export async function handlerReset(_cmdName: string, ...args: string[]): Promise<void> {
  const success = await deleteAllUsers();
  if (!success) {
    throw new Error("User deletion failed");
  }
  console.log("All users were deleted");
}

export async function handlerAllUsers(_cmdName: string, ...args: string[]): Promise<void> {
  const users = await getAllUsers();
  if (users.length === 0) {
    console.log("There are no registered users");
    return;
  }
  const currentUserName = readConfig().currentUserName;
  for (const user of users) {
    const isCurrent = user.name === currentUserName;
    console.log(`* ${user.name}${isCurrent ? " (current)" : ""}`);
  }
}
