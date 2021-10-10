const dayjs = require("dayjs");
const meow = require("meow");
const cli = meow();

/**
 * 默认获取一个符合语义化版本规范的构建版本号
 * @param isDocker 设为true后将不使用 + 号, 这将破坏规范
 * 
 * issue at: https://github.com/opencontainers/distribution-spec/issues/154
 */
function getNewBuildVersion(isDocker){
    const { version } = require("../package.json");
    const date = dayjs().format("YYYYMMDDHHmmss");
    const buildMeta = `build.${date}`;

    if(isDocker){
        return `${version}-${buildMeta}`
    }else{
        return `${version}+${buildMeta}`
    }
}

(function bootstrap(){
    process.stdout.write(getNewBuildVersion(cli.flags.docker));    
})();
