# RealTime Chat Application built with modern technologies as GraphQL, Apollo Server, Express, Socketio, RabbitMQ, Redis Caching etc. with Mongodb database.

The application enables users to chat seamlessly realtime and tries to optimize processes to manage server loading and reduce computations with proper data handling for a fast user experience.

# Use of rabbitmq

In this chat application RabbitMQ has been used for sending welcome email once user sign up. So once signup service triggers it sends a message to the queue in rabbitmq server and in queue message for welcome email sits until send-email service server is free. As we can send welcome email a bit later also this way our server load reduces.

send message => Exchange | api1: user signup, ap2: send a welcome email

# Use of Redis

get all messages => [Redis List stored in cache] => When user refreshes the page first it will check in cache if messages are there we get it from there which is way faster, and if its not in cache simply we will get messages from database and store in cache too.
It serves the purpose of reduced computations while getting messages and delivers a fast loading user experience.

# GraphQL

# The schema serves as the contract between the client and the server to define how a client can access the data

As schema is defined, the teams working on frontends and backends can do their work without further communication since they both are aware of the definite structure of the data that's sent over the network

# Frontend teams can easily test their applications by mocking the required data structure. Once the server is ready, the switch can be flipped for the client apps to load the data from the actual API.
