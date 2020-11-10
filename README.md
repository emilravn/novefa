# How to run locally

You either need NPM (Node) or Docker.

## NPM

- Make sure to install NPM and Node on your machine.
- Clone the repository and CD into the root directory.
- Run `npm install` to install dependencies.
- To start the application, run `node app.js` in the root directory.
- Visit http://localhost:8080

## Docker

- Make sure to install Docker on your machine.
- Clone the repository and CD into the root directory.
- Build the image by running `docker build -t p5/novefa_web_app .`
- You should now see the built image listed by running `docker images`
- To start the application, run `docker run --name novefa_app -p 80:8080 -d p5/novefa_web_app`

## Troubleshooting

- If you get an error saying port 80 is already in use, try another port on your machine, like 4937.
