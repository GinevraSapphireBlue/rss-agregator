import { readConfig } from "./config";
import { getUser } from "./lib/db/queries_users";
import { User } from "./lib/db/schema";

export async function getCurrentUserDbRecord(): Promise<User> {
  const currentUser = readConfig().currentUserName;
  if (!currentUser) throw new Error("No user logged in");
  
  const currentUserDb = await getUser(currentUser);
  if (!currentUserDb) throw new Error("User could not be found");

  return currentUserDb;
}