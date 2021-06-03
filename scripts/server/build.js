const {execSync} = require("child_process");


console.time("build project");

execSync("tsc",{stdio:"inherit"});

console.timeEnd("build project");
