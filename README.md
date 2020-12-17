# How to run locally

You either need NPM (Node) or Docker.

## NPM

- Make sure to install NPM and Node on your machine.
- Clone the repository and CD into the root directory.
- Run `npm install` to install dependencies.
- To start the application, run `node app.js` in the root directory.
- Visit http://localhost:8080

## Silent-printing

- To get rid of print dialogs when printing labels
- open cmd, navigate to 'Program Files (x86)\Google\Chrome\Application'
- run 'chrome.exe --kiosk-printing localhost:8080'
