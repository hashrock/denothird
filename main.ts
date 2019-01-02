#!/usr/bin/env deno --allow-write --allow-env --allow-run

import { args } from "deno";
import { parse } from "https://deno.land/x/flags/index.ts";
import { color } from "https://deno.land/x/colors/main.ts";

const pkg = parse(args)._[1];

const registryUrl =
  "https://raw.githubusercontent.com/hashrock/denothird/master/thirdparty.json";
const denolandUrl =
  "https://raw.githubusercontent.com/hashrock/denothird/master/denoland.json";
type Dict = { [key: string]: string };

function showList(thirdparty: Dict) {
  for (let i of Object.keys(thirdparty)) {
    console.log(color.bold(i) + " " + color.blackBright(thirdparty[i]));
  }
}

function generateImport(pkgName: string, tagName: string, packageUrl: string) {
  if (tagName === "master") {
    packageUrl = packageUrl.replace("${v}", "");
  } else {
    packageUrl = packageUrl.replace("${v}", "@" + tagName);
  }
  return `import * as ${pkgName} from "${packageUrl}";`;
}

async function main(pkg?: string) {
  const thirdparty: Dict = await fetch(registryUrl).then(i => i.json());
  const denoland: Dict = await fetch(denolandUrl).then(i => i.json());
  const registry: Dict = { ...thirdparty, ...denoland };
  if (!pkg) {
    showList(registry);
    return;
  }

  let pkgName = pkg;
  let tagName = "master";
  if (pkg.indexOf("@") >= 0) {
    pkgName = pkg.split("@")[0];
    tagName = pkg.split("@")[1];
  }
  let packageUrl = registry[pkgName];

  if (pkgName && packageUrl) {
    console.log(generateImport(pkgName, tagName, packageUrl));
  } else {
    showList(registry);
  }
}
main(pkg);
