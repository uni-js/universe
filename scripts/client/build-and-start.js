const {execSync} = require("child_process");

require("./build");

execSync("serve ./web-dist",{stdio:"inherit"});
