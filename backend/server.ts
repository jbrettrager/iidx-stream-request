const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
import { Song, SongDatabase, FilterDb } from "./types";

app.use(cors());

const server = http.createServer(app);
const roomList: string[] = [];

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const rooms = io.of("/").adapter.rooms;
const songDatabase: SongDatabase = {};
const filterDb: FilterDb = {};
const requestDb: SongDatabase = {};

function createSongDb(csv: string): Song[] {
  console.log("DB BEING CREATED!!");
  let songDb: Array<Song> = [];
  const csvData: string = csv;
  const splitted: Array<String> = csvData.split(/\n/);
  splitted.shift();
  let songKey = 1;
  while (splitted[0]) {
    let shifted = splitted.shift();
    if (shifted) {
      let splitShifted = shifted.split(",");
      let currentSong: Song = {
        title: splitShifted[1],
        genre: splitShifted[2],
        artist: splitShifted[3],
        version: splitShifted[0],
        beginnerDiff: splitShifted[5],
        normalDiff: splitShifted[12],
        hyperDiff: splitShifted[19],
        anotherDiff: splitShifted[26],
        leggendariaDiff: splitShifted[33],
        playedDate: new Date(splitShifted[40].split(" ")[0]).getTime(),
        requestDiff: "",
      };
      songDb.push(currentSong);
      songKey++;
    }
  }
  return songDb;
}

function checkExisting(requestList: Array<Song>, song: Song): boolean {
  let found = false;
  if (requestList === undefined || requestList.length === 0) return found;
  else {
    for (let i = 0; i < requestList.length; i++) {
      if (
        song.title === requestList[i].title &&
        song.requestDiff === requestList[i].requestDiff
      )
        found = true;
    }
    return found;
  }
}

io.on("connection", (socket: any) => {
  console.log("User connected:", socket.id);
  io.to(socket.id).emit("get_room_list", { roomList });

  socket.on("create_room", (data: any) => {
    const newRoom: string = data.roomName;
    socket.join(newRoom);
    roomList.push(newRoom);
    const database: Array<Song> = createSongDb(data.csvData);
    songDatabase[data.roomName] = database;
    filterDb[data.roomName] = [
      data.defaultLevelFilters,
      data.defaultDifficulties,
    ];
    console.log("created songdb for room", data.roomName);
    console.log(rooms);
    io.emit("update_room_list", { roomList });
    io.to(data.roomName).emit("roomData", { csv: songDatabase[data.roomName] });
  });

  socket.on("join_room", (data: any) => {
    let name = data.roomName;
    socket.join(name);
    socket.emit("initial_room_updates", {
      songs: songDatabase[name],
      filters: [filterDb[name][0], filterDb[name][1]],
    });
    console.log("JOINED", rooms);
  });

  socket.on("host_update_filters", (data: any) => {
    filterDb[data.roomName] = [data.levelFilters, data.difficulties];
    io.to(data.roomName).emit("send_updated_filters", {
      level: data.levelFilters,
      difficulties: data.difficulties,
    });
  });

  socket.on("send_request", (data: any) => {
    console.log(
      "Request received for:",
      data.song,
      data.difficulty,
      "to room",
      data.room
    );
    if (checkExisting(requestDb[data.room], data.song)) {
      io.to(data.room).emit("request_exists", {
        error: "Request already exists.",
      });
    } else {
      io.to(data.room).emit("receive_request", { song: data.song });
    }
  });

  socket.on("request_to_backend", (data: any) => {
    requestDb[data.roomName] = data.requestList;
  });
});

server.listen(3001, () => console.log("app is listening on port 3001"));
