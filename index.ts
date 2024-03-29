import fs from "fs";
import yaml from "js-yaml";
import { globSync } from "glob";
import { relative } from "path";

const config = yaml.load(fs.readFileSync("nitric.yaml", "utf8")) as {
  handlers: string[];
};

if (!config.handlers) {
  throw new Error("Handlers not defined in config file");
}

config.handlers.forEach((handlerGlob: string) => {
  const files = globSync(`${__dirname}/${handlerGlob}`, { absolute: true });
  files
    .filter((file) => file.slice(-3) === ".ts")
    .forEach((file) => {
      import(`./${relative('.', file)}`);
    });
});
