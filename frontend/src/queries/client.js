// import necessary modules
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

// create an http link
const httpLink = createHttpLink({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT,
});

// create an Apollo Client instance
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
