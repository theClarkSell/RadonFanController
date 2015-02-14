/*
 * (C) 2014 Seth Lakowske
 */

var gitPull       = require('git-pull');
var git           = require('git-rev');
var exec          = require('child_process').exec;
var createHandler = require('github-webhook-handler');

/*
 * Deployer listens for github push events and pulls the changes
 * if the current directories branch has changes.  It kills the current
 * process and the daemon manager (forever) relaunches the server with
 * the up-to-date code.
 */
function deployer(options) {
    var handler = createHandler(options);
    var version = null;

    handler.on('error', function (err) {
        console.error('Error:', err.message)
    })

    handler.on('push', function (event) {

        var refParts = event.payload.ref.split('/');

        //Warning: not sure if this is valid in all cases
        var pushBranch = refParts[refParts.length-1];
        console.log('push branch name: ' + pushBranch);

        //get our current branch
        git.branch(function (cwdBranch) {
            console.log('current branch name ', cwdBranch)

            if (cwdBranch !== pushBranch) {
                return;
            }

            //pull the latest changes
            gitPull('./', function (err, consoleOutput) {
                if (err) {
                    console.error("Error!", err, consoleOutput);
                } else {
                    console.log("Success!", consoleOutput);
                    exec('npm install', function(err, stdout, stderr) {
                        console.log(stdout.split('\n').join(''));
                        process.exit(0);
                    });

                }
            });

        })

    })

    return function(req, res) {

        if (req.url === '/version') {

            var gitRespFunction = function(version) {
                res.setHeader('Content-Type', 'text/plain');
                res.end(version);
            }

            git.long(gitRespFunction);

        } else {

            handler(req, res, function (err) {
                res.statusCode = 404
                res.end('no such location')
            })

        }

     }


}

module.exports = deployer;
