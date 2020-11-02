const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [ 
    { 
        mode: 'development', 
        entry: './src/electron.ts', 
        target: 'electron-main', 
        module: { 
        rules: [
            { 
                test: /\.ts$/, 
                include: /src/, 
                use: [{ loader: 'ts-loader' }] 
            }
        ]},
        output: { 
            path: __dirname + '/dist', 
            filename: 'electron.js',
            publicPath: ''
        }
    },
    { 
        mode: 'development', 
        entry: './src/index.tsx', 
        target: 'electron-renderer', 
        devtool: 'source-map', 
        resolve: {
            alias: {
              ['@']: path.resolve(__dirname, 'src')
            },
            extensions: ['.tsx', '.ts', '.js'],   
        },
        module: {
            rules: [
                // we use babel-loader to load our jsx and tsx files
                {
                    test: /\.(ts|js)x?$/,
                    use: {
                        loader: 'babel-loader'
                    },
                },
            ],
        }, 
        output: { 
            path: __dirname + '/dist', 
            filename: 'index.js', 
            publicPath: ''
        }, 
        plugins: [ 
            new HtmlWebpackPlugin({ 
                template: './src/index.html', 
                devServer: {
                    contentBase: path.join(__dirname, 'dist'),
                    compress: true,
                    port: 8080,
                    publicPath: '/'
                },    
            }),
        ],
    }, 
];