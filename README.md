# Use of rabbitmq

send message => Exchange | api1: send to socket, ap2: send to database

# Use of Redis

send message => [Redis List] => Exchange => api1, api2.

# The schema serves as the contract between the client and the server to define how a client can access the data

# Once the schema is defined, the teams working on frontends and backends can do their work without further communication since they both are aware of the definite structure of the data that's sent over the network

# Frontend teams can easily test their applications by mocking the required data structure. Once the server is ready, the switch can be flipped for the client apps to load the data from the actual API.
