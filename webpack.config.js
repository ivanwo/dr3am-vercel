const path = require("path");
const webpack = require("webpack");

/*We are basically telling webpack to take index.js from entry. Then check for all file extensions in resolve. 
After that apply all the rules in module.rules and produce the output and place it in main.js in the public folder.*/

module.exports={
    /** "mode"
     * the environment - development, production, none. tells webpack 
     * to use its built-in optimizations accordingly. default is production 
     */
    // TODO: parameterize this so that it builds on the server for prod but the local for dev
    mode: "production", 
    // mode: "development", 
    /** "entry"
     * the entry point 
     */
    entry: "./index.js", 
    output: {
        /** "path"
         * the folder path of the output file 
         */
        path: path.resolve(__dirname, "./public"),
        // static: path.resolve(__dirname, './public'),
        /** "filename"
         * the name of the output file 
         */
        filename: "main.js",
        publicPath: "/"
    },
    /** "target"
     * setting "node" as target app (server side), and setting it as "web" is 
     * for browser (client side). Default is "web"
     */
    target: "web",
    devServer: {
        port: "9500",
        // static: ["./public"],
        static: path.resolve(__dirname, './public'),
        open: true,
        /** "hot"
         * enabling and disabling HMR. takes "true", "false" and "only". 
         * "only" is used if enable Hot Module Replacement without page 
         * refresh as a fallback in case of build failures
         */
        hot: true,
        /** "liveReload"
         * disable live reload on the browser. "hot" must be set to false for this to work
        */
        liveReload: true,
        historyApiFallback: true
    },
    resolve: {
        /** "extensions" 
         * If multiple files share the same name but have different extensions, webpack will 
         * resolve the one with the extension listed first in the array and skip the rest. 
         * This is what enables users to leave off the extension when importing
         */
        alias: { mydir: path.resolve(__dirname, "/")},
        extensions: ['.js','.jsx','.json'] 
    },
    performance: {
        hints: false
        // maxEntryPointSize: 512000,
        // maxAssetSize: 512000
    },
    module:{
        /** "rules"
         * This says - "Hey webpack compiler, when you come across a path that resolves to a '.js or .jsx' 
         * file inside of a require()/import statement, use the babel-loader to transform it before you 
         * add it to the bundle. And in this process, kindly make sure to exclude node_modules folder from 
         * being searched"
         */
        rules: [
            {
                test: /\.(js|jsx)$/,    //kind of file extension this rule should look for and apply in test
                exclude: /node_modules/, //folder to be excluded
                use:  'babel-loader' //loader which we are going to use
            }
        ]
    }
}