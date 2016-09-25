var fs = require('fs-extra');
var path = require('path');
var child_process = require('child_process');
var webpack = require('webpack');
var WebpackOnBuildPlugin = require('on-build-webpack');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var FolderZip = require('folder-zip');
var autoprefixer = require('autoprefixer');

var srcDir = path.join(__dirname, 'src');
var buildDir = path.join(__dirname, 'build');
var targetDir = path.join(buildDir, 'unpacked');

module.exports = {
    entry: {
        'background': [path.join(srcDir, 'js', 'background.js')],
        'content-script': [path.join(srcDir, 'js', 'content-script', 'main.js')],
        'popup': [path.join(srcDir, 'js', 'popup.js')],
        'options': [path.join(srcDir, 'js', 'options.js')]
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
            sourceMap: false
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new CleanWebpackPlugin([buildDir], {verbose: false}),
        new WebpackOnBuildPlugin(function () {
            var pkgData = fs.readJsonSync(path.join(__dirname, 'package.json'));
            var mData = fs.readJsonSync(path.join(srcDir, 'manifest.json'));
            mData.version = pkgData.version;
            fs.writeJsonSync(path.join(targetDir, 'manifest.json'), mData);

            ['images', 'pages'].forEach(function (dir) {
                fs.copySync(
                    path.join(srcDir, dir),
                    path.join(targetDir, dir)
                );
            });

            var zip = new FolderZip();
            zip.zipFolder(targetDir, {excludeParentFolder: true}, function () {
                zip.writeToFile(path.join(buildDir, pkgData.name + '-v' + pkgData.version + '.zip'))
            })
        }),
    ],
    // devtool: 'source-map',
    postcss: [
        autoprefixer()
    ],
    resolve: {
        extensions: ['', '.js', '.jsx'],
        alias: {
            'react': 'react-lite',
            'react-dom': 'react-lite'
        }
    }
};