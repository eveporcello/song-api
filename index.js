const { ApolloServer, gql } = require("apollo-server");
const { generate } = require("shortid");
const songs = require("./data/songs.json");
const performers = require("./data/performers.json");

const typeDefs = gql`
  type Song {
    id: ID!
    performerId: Int
    title: String
    numberOne: Boolean
    performer: Performer
  }

  type Performer {
    id: ID!
    name: String
    songs: [Song!]!
  }

  type Query {
    allSongs: [Song!]!
    song(title: String!): Song!
    allPerformers: [Performer!]!
    performer(name: String!): Performer!
  }

  type Mutation {
    addSong(title: String!, numberOne: Boolean, performerName: String!): Song
  }
`;

const resolvers = {
  Query: {
    allSongs: () => songs,
    allPerformers: () => performers,
    song: (parent, { title }) => songs.find(song => title === song.title),
    performer: (parent, { name }) =>
      performers.find(performer => name === performer.name)
  },
  Performer: {
    songs: performer => songs.filter(s => s.performerId === performer.id)
  },
  Song: {
    performer: song => performers.find(p => p.id === song.performerId)
  },
  Mutation: {
    addSong: (parent, { title, numberOne = false, performerName }) => {
      var performer = performers.filter(
        p => p.name.toLowerCase() === performerName.toLowerCase()
      );
      if (performer[0]) {
        var newSong = {
          title,
          numberOne,
          performerId: performer[0].id,
          id: generate()
        };
        songs.push(newSong);
        return newSong;
      } else if (!performer[0]) {
        var newSong = {
          title,
          numberOne,
          performerId: generate(),
          id: generate()
        };
        songs.push(newSong);
        var newPerformer = {
          id: newSong.performerId,
          name: performerName
        };
        performers.push(newPerformer);
        return newSong;
      }
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => console.log(`Server running on ${url}`));
