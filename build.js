var fs = require('fs-extra');
var path = require('path');
var child_process = require('child_process');
var webpack = require('webpack');
var WebpackOnBuildPlugin = require('on-build-webpack');
var FolderZip = require('folder-zip');
var autoprefixer = require('autoprefixer');

var srcDir = path.join(__dirname, 'src');
var buildDir = path.join(__dirname, 'build');
var targetDir = path.join(buildDir, 'unpacked');

// clean build dir
fs.emptyDirSync(buildDir);
// create target dir
fs.ensureDirSync(targetDir);

// Images
fs.copySync(
    path.join(srcDir, 'images'),
    path.join(targetDir, 'images')
);
// Pages
fs.copySync(
    path.join(srcDir, 'pages'),
    path.join(targetDir, 'pages')
);

var packageInfo = require(path.join(__dirname, 'package.json'));

////////////////////////////////////////
// MANIFEST ////////////////////////////
////////////////////////////////////////

var mData = fs.readJsonSync(path.join(srcDir, 'manifest.json'));
mData.version = packageInfo.version;

fs.writeJsonSync(
    path.join(targetDir, 'manifest.json'),
    mData
);

////////////////////////////////////////
// BACKGROUND & CONTENT ////////////////
////////////////////////////////////////
webpack({
    entry: {
        'background': [path.join(srcDir, 'js', 'background.js')],
        'content-script': [path.join(srcDir, 'js', 'content-script', 'main.js')],
        'popup': [path.join(srcDir, 'js', 'popup.js')]
    },
    output: {path: targetDir, filename: '[name].js'},
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                include: path.join(srcDir, 'js'),
                loader: 'babel?cacheDirectory'
            },
            {
                test: /\.css$/,
                include: path.join(srcDir, 'styles', 'modules'),
                loader: 'style!css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:8]!postcss-loader'
            },
            {
                test: /\.css$/,
                include: path.join(srcDir, 'styles'),
                exclude: path.join(srcDir, 'styles', 'modules'),
                loader: 'style!css-loader?importLoaders=1&!postcss-loader'
            },
            {
                test: /[\\\/]images[\\\/]/,
                loader: 'file?name=images/[name].[ext]'
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                screw_ie8: true
            },
            comments: false,
            sourceMap: true
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new WebpackOnBuildPlugin(function (stats) {
            var zip = new FolderZip();
            zip.zipFolder(targetDir, {excludeParentFolder: true}, function () {
                zip.writeToFile(path.join(buildDir, 'extension-v' + packageInfo.version + '.zip'))
            })
        }),
    ],
    devtool: 'source-map',
    postcss: [
        autoprefixer()
    ],
    resolve: {
        extensions: ['', '.js', '.jsx']
    }
}, function (err, stats) {
    if (err !== null) console.log(err);
    var jStats = stats.toJson();
    if (jStats.errors.length > 0) jStats.errors.forEach(function (m) { console.log('ERR', m); });
    if (jStats.warnings.length > 0) jStats.warnings.forEach(function (m) { console.log('WARN', m); });
});

