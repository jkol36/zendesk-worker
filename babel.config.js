
module.exports  = function (api) {
    api.cache(true)
    const presets = [["@babel/preset-env", { "targets": "defaults" }]]
    const plugins = []
    return {
        preset,
        plugins
    }
}
