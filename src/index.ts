import { readConfig, setUser } from "./config"

function main() {
  let config = readConfig();
  setUser(config, "Lane");
  let updatedConfig = readConfig();
  console.log(updatedConfig);
}

main();

