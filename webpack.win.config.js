const path = require('path');
const webpack = require('webpack');

module.exports = {
    target: 'node',
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: {
        app: './src/index.js',
        worker: './src/worker.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [
                            '@babel/plugin-proposal-class-properties',
                            '@babel/plugin-transform-runtime'
                        ]
                    }
                }
            },
            {
                test: /\.node$/,
                use: 'node-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.json'],
        fallback: {
            "fs": false,
            "path": require.resolve("path-browserify"),
            "crypto": require.resolve("crypto-browserify"),
            "stream": require.resolve("stream-browserify"),
            "buffer": require.resolve("buffer/"),
            "util": require.resolve("util/"),
            "assert": require.resolve("assert/"),
            "http": require.resolve("stream-http"),
            "https": require.resolve("https-browserify"),
            "os": require.resolve("os-browserify/browser"),
            "url": require.resolve("url/")
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            'process.platform': JSON.stringify('win32'),
            'process.arch': JSON.stringify('x64')
        }),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser'
        })
    ],
    optimization: {
        minimize: process.env.NODE_ENV === 'production',
        splitChunks: {
            chunks: 'all',
            minSize: 20000,
            minRemainingSize: 0,
            minChunks: 1,
            maxAsyncRequests: 30,
            maxInitialRequests: 30,
            enforceSizeThreshold: 50000,
            cacheGroups: {
                defaultVendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    reuseExistingChunk: true
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        }
    },
    node: {
        __dirname: false,
        __filename: false
    },
    performance: {
        hints: process.env.NODE_ENV === 'production' ? "warning" : false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
    stats: {
        colors: true,
        reasons: true,
        chunks: true
    },
    devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'eval-source-map',
    watchOptions: {
        aggregateTimeout: 600,
        ignored: ['**/node_modules', '**/dist']
    },
    externals: [
        {
            'utf-8-validate': 'commonjs utf-8-validate',
            'bufferutil': 'commonjs bufferutil',
            'canvas': 'commonjs canvas'
        },
        function(context, request, callback) {
            if (/^native_/.test(request)) {
                return callback(null, 'commonjs ' + request);
            }
            callback();
        }
    ],
    experiments: {
        topLevelAwait: true,
        asyncWebAssembly: true
    }
};
