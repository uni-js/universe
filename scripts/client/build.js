const {execSync} = require("child_process");

console.log("building view...")

const proc = execSync("webpack",{stdio:["ignore",process.stdout,process.stderr]});


console.log("view has been built...");
