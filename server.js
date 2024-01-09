import { ApolloServer, gql } from "apollo-server";
import fetch from "node-fetch";
let tweetdb = [
  {
    id: "1",
    text: "hello first",
    userId: "1",
  },
  {
    id: "2",
    text: "hello second",
    userId: "1",
  },
  {
    id: "3",
    text: "hello third",
    userId: "3",
  },
];

let userdb = [
  {
    id: "1",
    firstName: "HK",
    lastName: "N",
  },
  {
    id: "2",
    firstName: "BC",
    lastName: "A",
  },
];

const typeDefs = gql`
  """
  User object yeah
  """
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    """
    full name created firstName + lastName, no exist in DB
    """
    fullName: String!
  }

  """
  Tweet object yeah
  """
  type Tweet {
    id: ID!
    text: String!
    author: User
  }
  type Query {
    allMovies: [Movie!]!
    allUsers: [User!]!
    allTweets: [Tweet!]!
    tweet(id: ID): Tweet
    movie(id: String!): Movie
  }
  type Mutation {
    postTweet(text: String!, userId: ID!): Tweet!
    """
    it will delete tweet if found, else return false
    """
    deleteTweet(id: ID!): Boolean!
  }

  type Movie {
    id: Int!
    url: String!
    imdb_code: String!
    title: String!
    title_english: String!
    title_long: String!
    slug: String!
    year: Int!
    rating: Float!
    runtime: Float!
    genres: [String]!
    summary: String
    description_full: String!
    synopsis: String
    yt_trailer_code: String!
    language: String!
    background_image: String!
    background_image_original: String!
    small_cover_image: String!
    medium_cover_image: String!
    large_cover_image: String!
  }
`;

const resolvers = {
  Query: {
    allTweets() {
      return tweetdb;
    },
    tweet(root, { id }) {
      console.log(`id is ${id}`);
      return tweetdb.find((tweet) => tweet.id === id);
    },
    allUsers() {
      console.log("allUsers called");
      return userdb;
    },
    allMovies() {
      return fetch("https://yts.mx/api/v2/list_movies.json")
        .then((response) => response.json())
        .then((json) => json.data.movies);
    },
    movie(_, { id }) {
      return fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`)
        .then((response) => response.json())
        .then((json) => json.data.movie);
    },
  },
  Mutation: {
    postTweet(_, { text, userId }) {
      const newTweet = {
        id: tweetdb.length + 1,
        text,
      };
      tweetdb.push(newTweet);
      return newTweet;
    },
    deleteTweet(_, { id }) {
      const tweet = tweetdb.find((tweet) => tweet.id === id);
      if (!tweet) return false;
      tweetdb = tweetdb.filter((tweet) => tweet.id !== id);
      return true;
    },
  },
  User: {
    fullName({ firstName, lastName }) {
      return `${firstName} ${lastName}`;
    },
  },
  Tweet: {
    author({ userId }) {
      const result = userdb.find((user) => user.id === userId);
      if (!result) {
        console.log("no result");
        return null;
      }
      return result;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`running : ${url}`);
});
