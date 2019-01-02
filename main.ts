#!/usr/bin/env deno --allow-write --allow-env --allow-run

import { args } from "deno";
import { parse } from "https://deno.land/x/flags/index.ts";
import { color } from "https://deno.land/x/colors/main.ts";

const pkg = parse(args)._[1];

const registryUrl =
  "https://raw.githubusercontent.com/hashrock/deno3rd/master/src/database.json";
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
  if (!pkg) {
    showList(thirdparty);
    return;
  }

  let pkgName = pkg;
  let tagName = "master";
  if (pkg.indexOf("@") >= 0) {
    pkgName = pkg.split("@")[0];
    tagName = pkg.split("@")[1];
  }
  let packageUrl = thirdparty[pkgName];

  if (pkgName && packageUrl) {
    console.log(generateImport(pkgName, tagName, packageUrl));
  } else {
    showList(thirdparty);
  }
}
main(pkg);
