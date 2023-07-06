import { api, websocket, collection, schedule } from "@nitric/sdk";
import fs from 'fs';

// API to serve whiteboard assets
const whiteboard = api('whiteboard');
// socket to emit drawing data on
const drawing = websocket('drawing');
// Store connections for transmitting data
const connections = collection('connections').for('reading', 'writing', 'deleting');

// serve the index page
// render single page with injected assets
whiteboard.get("/", async (ctx) => {
     // read the script content for injection
     const scriptFile = await fs.promises.readFile(`public/main.js`);
     const script = scriptFile.toString('utf-8');

     const cssFile = await fs.promises.readFile(`public/style.css`);
     const styles = cssFile.toString('utf-8');     
 
     ctx.res.headers['Content-Type'] = ['text/html'];
 
     ctx.res.body = `
    <html lang="en">
        <head>
        <meta charset="UTF-8">
        <title>Nitric websocket whiteboard</title>
        <link rel="stylesheet" href="style.css">
        <style>
        ${styles}
        </style>
        </head>
        <body>
        
        <canvas class="whiteboard" ></canvas>
        
        <div class="colors">
            <div class="color black"></div>
            <div class="color red"></div>
            <div class="color green"></div>
            <div class="color blue"></div>
            <div class="color yellow"></div>
        </div>
        
        <script>
        ${script}
        </script>
        </body>
    </html>
     `
 
     return ctx;
});

whiteboard.get("/address", async (ctx) => {
    ctx.res.body = await drawing.url();
});

// When a client connects
// XXX: Never use the websocket on the connect call (instead defer the call using)
drawing.on('connect', async (ctx) => {
    console.log(`connecting client ${ctx.req.connectionId}`);
    // Register the connection
    // we can get the unique connectionId of the client here
    // this can be used to send messages to an individual client
    await connections.doc(ctx.req.connectionId).set({
        connectionId: ctx.req.connectionId,
    });

    console.log(`stored client connection ${ctx.req.connectionId}`);
});

// When a client disconnects
drawing.on('disconnect', async (ctx) => {
    console.log(`disconnecting client ${ctx.req.connectionId}`);
    // Register a disconnection
    // we can get the unique connectionId of the client here
    // this can be used to de-register the client
    await connections.doc(ctx.req.connectionId).delete();
});

// When a message is received
drawing.on('message', async (ctx) => {   
    // broadcast message to all other clients
    const connectionStream = connections.query().stream()

    const streamEnd = new Promise<void>((res) => {
        connectionStream.on('end', () => {
            res();
        });
    });
    
    connectionStream.on('data', async connection => {
        if (connection.content.connectionId && connection.content.connectionId !== ctx.req.connectionId) {
            await drawing.send(connection.content.connectionId, ctx.req.data);
        }
    });

    await streamEnd;
});