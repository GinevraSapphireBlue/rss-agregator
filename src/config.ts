import os from "os";
import fs from "fs";
import path from "path";

type Config = {
  dbUrl: string;
  currentUserName: string | undefined;
};

export function setUser(config: Config, userName: string) {
  config.currentUserName = userName;
  writeConfig(config);
}

export function readConfig(): Config {
  const cfgFile = fs.readFileSync(getConfigFilePath(), { encoding: "utf-8"})
  const cfg: Config = JSON.parse(cfgFile);
  return validateConfig(cfg);
}

function getConfigFilePath(): string {
  return path.join(os.homedir(), "/.gatorconfig.json");
}

function validateConfig(rawConfig: any): Config {
  if (typeof rawConfig.db_url !== "string") {
    throw new Error("Invalid config file, db_url has to be present");
  }
  if (rawConfig.current_user_name && typeof rawConfig.current_user_name !== "string") {
    throw new Error("Invalid config file, current_user_name has to be a string if present")
  }

  return {
    dbUrl: rawConfig.db_url,
    currentUserName: rawConfig.current_user_name,
  };
}

function writeConfig(config: Config): void {
  const cfgString = JSON.stringify({
    db_url: config.dbUrl,
    current_user_name: config.currentUserName,
  });
  fs.writeFileSync(getConfigFilePath(), cfgString, { encoding: "utf-8"})
}