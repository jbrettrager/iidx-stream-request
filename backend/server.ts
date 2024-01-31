const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
import { Song, SongDatabase, FilterDb, CooldownDb, IsColumnDb, SentRequestDb, SentRequest, HostKeysDb } from "./types";

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
const cooldownDb: CooldownDb = {};
const isColumnDb: IsColumnDb = {}
const sentRequestDb: SentRequestDb = {}
const hostKeysDb: any = {}

function createSongDb(csv: string): Song[] {
  console.log("DB BEING CREATED!!");
  let songDb: Array<Song> = [];
  const csvData: string = csv;
  const splitted: Array<String> = csvData.split(/\n/);
  splitted.shift();
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
    }
  }
  return songDb;
}

function checkRoomName(roomName: string): boolean {
  let result = false;
  if (roomList[0] === undefined) return result;
  else {
    for (let i = 0; i < roomList.length; i++) {
      if (roomList[i] === roomName) result = true;
    }
    return result;
  }
}


io.on("connection", (socket: any) => {
  io.to(socket.id).emit("get_room_list", { roomList });

  socket.on("landing_lobby", (data: any) => {
    socket.join("lobby")
    io.to("lobby").emit("lobby_join_rooms", {roomList})
  })

  socket.on("join_room_host", (data: any) => {
    let roomName: string = data.roomName
    let hostKey: string = data.hostKey
      if (hostKeysDb[roomName] !== "") {
        console.log("room exists")
        if (hostKeysDb[roomName] === hostKey) {
          console.log("key match", hostKeysDb[roomName], hostKey)
          io.to(socket.id).emit("room_join_host", {join: true})
        }
        else {
          console.log("KEY MISMATCH!")
        }
      }
      else if (hostKeysDb[roomName] === "") {
        console.log("room doesnt exist, creating", roomName)
        hostKeysDb[roomName] = hostKey
        io.to(socket.id).emit("room_join_host", {join: true})
      }
  });

  socket.on("join_room_guest", (data:any) => {
    if (checkRoomName(data.roomName)) {
      io.to(socket.id).emit("room_guest_join", {join:true})
    }
  })

  socket.on("join_room_streamview", (data:any) => {
    let roomName = data.roomName
    let sentKey = data.hostKey
    if (hostKeysDb[roomName] === sentKey) {
      io.to(socket.id).emit("room_join_streamview", {join: true})
    }
  })

  socket.on("create_room", (data: any) => {
    const newRoom: string = data.roomName;
    roomList.push(newRoom);
    io.to("lobby").emit("room_created", {roomList})
    const database: Array<Song> = createSongDb(data.csvData);
    songDatabase[data.roomName] = database;
    filterDb[data.roomName] = [
      data.defaultLevelFilters,
      data.defaultDifficulties,
    ];
    cooldownDb[data.roomName] = data.cooldown
    isColumnDb[data.roomName] = data.isColumn
    sentRequestDb[data.roomName] = {}
    hostKeysDb[data.roomName] = ""
    io.emit("update_room_list", { roomList });
    io.to(data.roomName).emit("roomData", { csv: songDatabase[data.roomName] });
  });

  socket.on("join_room", (data: any) => {
    socket.join(data.roomName);
    if (requestDb[data.roomName]) {
    socket.emit("initial_room_updates", {
      songs: songDatabase[data.roomName],
      filters: [filterDb[data.roomName][0], filterDb[data.roomName][1]],
      cooldown: cooldownDb[data.roomName],
      requestList: requestDb[data.roomName],
      isColumn: isColumnDb[data.roomName]
    });}
    else {
      socket.emit("initial_room_updates", {
        songs: songDatabase[data.roomName],
        filters: [filterDb[data.roomName][0], filterDb[data.roomName][1]],
        cooldown: cooldownDb[data.roomName],
        requestList: [],
        isColumn: isColumnDb[data.roomName] 
      });
    }
    console.log("JOINED", rooms);
  });
  

  socket.on("stream_display_change", (data: any) => {
    isColumnDb[data.roomName] = data.isColumn
    io.to(data.roomName).emit("update_stream_view", {isColumn: data.isColumn})
  })
  
  socket.on("host_update_filters", (data: any) => {
    filterDb[data.roomName] = [data.levelFilters, data.difficulties];
    io.to(data.roomName).emit("send_updated_filters", {
      level: data.levelFilters,
      difficulties: data.difficulties,
    });
  });

  socket.on("send_request", (data: any) => {
    if (!requestDb[data.room]) {
      requestDb[data.room] = [data.song];
    } else requestDb[data.room].push(data.song);
    io.to(data.room).emit("receive_request", { song: data.song });
    io.to(data.room).emit("update_requests", {
      requestList: requestDb[data.room],
    });
  });

  socket.on("request_to_backend", (data: any) => {
    requestDb[data.roomName] = data.requestList;
  });

  socket.on("remove_from_requests", (data: any) => {
    requestDb[data.roomName] = data.requestList;
    io.to(data.roomName).emit("update_requests", {
      requestList: data.requestList,
    });
  });

  socket.on("send_cooldown", (data: any) => {
    cooldownDb[data.roomName] = data.cooldown;
    io.to(data.roomName).emit("update_cooldown", { cooldown: data.cooldown });
  });
});

server.listen(3001, () => console.log("app is listening on port 3001"));
