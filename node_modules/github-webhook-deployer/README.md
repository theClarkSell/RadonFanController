# github-webhook-deployer 

deploys changes using github push events.

``` js
var deployer = require('github-webhook-deployer');

var server   = http.createServer(deployer({
    path : '/webhook',
    secret : 'testSecret' 
})).listen(3000);
```

# Operation

1. When a push event occurs, the current directory's branch is compared to the push event branch.
2. If they are the same, git pull; npm install and then terminate the server process.
3. The server process is restarted by foreverjs (or an equivelent daemon manager).
4. Deployment is complete and you are running the latest code.

# Example

Somewhere in the cloud there are two copies of a server, production and development.
The production branch is in ~/production and the development is in ~/development.
Both servers are started using the daemon manager foreverjs.

Now a developer wants to make some changes to the code.  The developer does a checkout of the 
development branch on their local laptop/workstation, they run the server locally and make some 
changes.  The developer can then push the changes to github.

Github webhooks broadcast the developer's change event to the production and development servers in the 
cloud.  The development server sees the update, pulls in the changes and restarts.  The 
developer can now test the changes on development server in the cloud. 

Once satisfied the development server is stable, he/she can merge the changes into the 
production branch. Another push event is triggerd and this time the production server sees the 
update, pulls in the changes and restarts.  No SSHing into the server, git pulling, and 
restarting the server.  All is well.

# Tutorial

[Deploying to your server with a git push using Github webhooks and Forever.js](http://sethlakowske.com/articles/github-push-event-deployment/)