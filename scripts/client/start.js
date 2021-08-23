const {execSync} = require("child_process");
execSync("serve ./web-dist",{stdio:["ignore",process.stdout,process.stderr]});