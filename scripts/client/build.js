const {execSync} = require("child_process");

console.log("building view...")

execSync("webpack",{stdio:"inherit"});

console.log("view has been built...");
