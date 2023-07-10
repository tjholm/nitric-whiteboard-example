import { websocket, collection, http } from "@nitric/sdk";
import express from "express";

// socket to emit drawing data on
const drawing = websocket('drawing');
// Store connections for transmitting data
const connections = collection('connections').for('reading', 'writing', 'deleting');

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

    const streamEnd = new Promise<any>((res) => {
        connectionStream.on('end', res);
    });
    
    connectionStream.on('data', async ({ content }) => {
        if (content.connectionId && content.connectionId !== ctx.req.connectionId) {
            await drawing.send(content.connectionId, ctx.req.data);
        }
    });

    await streamEnd;
});

const app = express();

// serve our react app
app.use(express.static("./public"));
app.use(express.json());

// Have a relative endpoint for 
app.get('/address', async (req, res) => {
    const url = await drawing.url();

    res.status(200).contentType('text/plain').send(url);
});

// Create a new client connection for our app
app.post('/connection', async (req, res) => {
    // TODO:
    // Create a new pending connection and only accept connection requests that exist already in our database
    // add a schedule to cleanup connections that don't contain a connectionId
});

http(app);