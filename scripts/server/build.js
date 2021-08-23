const {execSync} = require("child_process");


console.time("build project");

execSync("tsc",{stdio:["ignore",process.stdout,process.stderr]});

console.timeEnd("build project");
