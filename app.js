 const Hapi = require("hapi");
 const monk = require('monk');
 const server = Hapi.Server({
    port: 3050,
    host: 'localhost',
    "routes": { "cors": true }
 });

 
 const db_url = 'mongodb://admin:admin123@ds227664.mlab.com:27664/wishlist_db';
 const db = monk(db_url);

 db.then(() => {
   console.log('Connected to MongoDB using Monk')
 })

 const users = db.get('users')
 const lists = db.get('lists')

 // User routes 

server.route({
    method: "GET",
    path: "/users",
    handler: (request, h) => { 
        
        return users.find({})  
    }
});

server.route({
    method: "GET",
    path: "/users/{id}",
    handler: (request, h) => { 
        
        return users.find({_id: request.params.id})  
    }
});
server.route({
    method: "GET",
    path: "/users/email/{_email}",
    handler: (request, h) => { 
        
        return users.find({email: request.params._email})  
    }
});
server.route({
    method: "GET",
    path: "/users/verify/{_email}",
    handler: (request, h) => { 
        
        return users.find({email: request.params._email}, 'email')  
    }
});
server.route({
    method: "POST",
    path: "/users",
    handler: (request, h) => {

        return users.insert( request.payload )
    }
});

server.route({
    method: "PATCH",
    path: "/users/{id}",
    handler: async (request, h) => {
        
        const [oldData] = await users.find({_id: request.params.id}, '-_id');
    
        const newData = {...oldData,...request.payload}

        return users.update({_id: request.params.id},  newData)

        .then((result) => h.response('User info has been updated.').code(200))
    }
});
server.route({
    method: "DELETE",
    path: "/users/{id}",
    handler: (request, h) => {

        return users.findOneAndDelete({_id: request.params.id})

        .then((result) => h.response('User has been deleted.').code(200))
    }
});

// lists routes

server.route({
    method: "GET",
    path: "/lists/{owner}",
    handler: (request, h) => { 
        
        return lists.find({owner: request.params.owner}, 
            {fields: {"_id": 1, "name": 1,"description": 1, "items": 1}})  
    }
});

server.route({
    method: "GET",
    path: "/list/{id}",
    handler: (request, h) => { 
        
        return lists.find({_id: request.params.id})  
    }
});

server.route({
    method: "POST",
    path: "/list",
    handler: (request, h) => {

        return lists.insert( request.payload )
    }
});

server.route({
    method: "PATCH",
    path: "/list/{id}",
    handler: async (request, h) => {
        
        const [oldData] = await lists.find({_id: request.params.id}, {fields: {"_id": 0, "owner": 0}});
    
        const newData = {...oldData,...request.payload}

        return lists.update({_id: request.params.id},  newData)

        .then((result) => h.response('List info has been updated.').code(200))
    }
});

server.route({
    method: "DELETE",
    path: "/list/{id}",
    handler: (request, h) => {

        return lists.findOneAndDelete({_id: request.params.id})

        .then((result) => h.response('List has been deleted.').code(200))
    }
});

const init = async () => {

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();