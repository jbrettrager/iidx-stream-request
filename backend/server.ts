const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const port = process.env.PORT || 3001
import {uriSecret} from "./config"
import { Room } from "./Room";
import {
  Song,
  SongDatabase,
  FilterDb,
  CooldownDb,
  IsColumnDb,
  SentRequestDb,
  SentRequest,
  HostKeysDb,
} from "./types";

app.use(cors());
 const uri = uriSecret
  
mongoose.connect(uri).then(console.log("connected to MongoDB"));

const server = http.createServer(app);
const roomList: string[] = [];

const io = new Server(server, {
  cors: {
    origin: "https://iidxrequestrooms.onrender.com/",
    methods: ["GET", "POST"],
  },
});

const rooms = io.of("/").adapter.rooms;

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

function checkRoomName(roomName: string, roomList: Array<string>): boolean {
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

  socket.on("landing_lobby", async (data: any) => {
    socket.join("lobby");
    try {
      const rooms = await Room.find()
      const newRoomList = rooms.map((room: any) => {return room["roomName"]})
      io.to("lobby").emit("lobby_join_rooms", { roomList: newRoomList });
    }
    catch (e: any) {
      console.log(e.message);
    }
    
  });

  socket.on("join_room_host", async (data: any) => {
    let roomName: string = data.roomName;
    let hostKey: string = data.hostKey;
    try {
      const savedHostKeyAwait = await Room.findOne({
        roomName: roomName,
      }).select("hostKey");
      const savedHostKey = savedHostKeyAwait["hostKey"];
      if (savedHostKey !== "") {
        console.log("room exists");
        if (savedHostKey === hostKey) {
          console.log("key match", savedHostKey, hostKey);
          io.to(socket.id).emit("room_join_host", { join: true });
        } else {
          console.log("KEY MISMATCH!", savedHostKey, hostKey);
        }
      } else if (savedHostKey === "") {
        console.log("room doesnt exist, creating", roomName);
        const query = { roomName: roomName };
        const update = { hostKey: hostKey };
        await Room.findOneAndUpdate(query, update);
        io.to(socket.id).emit("room_join_host", { join: true });
      }
    } catch (e: any) {
      console.log(e.message);
    }
  });


  socket.on("join_room_guest", async (data: any) => {
    try {
      const rooms = await Room.find()
      const newRoomList = rooms.map((room: any) => {return room["roomName"]})
      if (checkRoomName(data.roomName, newRoomList)) {
        io.to(socket.id).emit("room_guest_join", { join: true });
      }
    }
    catch (e: any) {
      console.log(e.message);
    }

  });

  socket.on("join_room_streamview", async (data: any) => {
    let roomName = data.roomName;
    let sentKey = data.hostKey;
    try {
      const hostKeyAwait = await Room.findOne({roomName: roomName})
      const savedHostKey = hostKeyAwait["hostKey"]
      if (savedHostKey === sentKey) {
        io.to(socket.id).emit("room_join_streamview", { join: true });
      }
    }
    catch (e: any) {
      console.log(e.message);
    }
   
  });


  socket.on("create_room", async (data: any) => {
    const roomName: string = data.roomName;
    roomList.push(roomName);
    const database: Array<Song> = createSongDb(data.csvData);
    try {
      await Room.create({
        roomName: roomName,
        songs: database,
        cooldown: data.cooldown,
        isColumn: data.isColumn,
        requests: [],
        hostKey: "",
        filters: [data.defaultLevelFilters, data.defaultDifficulties],
      });
      console.log("room created in MongoDB");
      const rooms = await Room.find()
      const newRoomList = rooms.map((room: any) => {return room["roomName"]})
      console.log(newRoomList)
      io.to("lobby").emit("room_created", { roomList: newRoomList });
    } catch (e: any) {
      console.log(e.message);
    }
  });


  socket.on("join_room", async (data: any) => {
    const roomName = data.roomName;
    const currentRoom = await Room.findOne({ roomName: roomName });
    socket.join(roomName);
    socket.emit("initial_room_updates", {
      songs: currentRoom["songs"],
      filters: [currentRoom["filters"][0], currentRoom["filters"][1]],
      cooldown: currentRoom["cooldown"],
      requestList: currentRoom["requests"],
      isColumn: currentRoom["isColumn"],
    });

    console.log("JOINED", rooms);
  });


  socket.on("stream_display_change", async (data: any) => {
    try {
      const query = {roomName: data.roomName}
      const update = {isColumn: data.isColumn}
      await Room.findOneAndUpdate(query, update)
      io.to(data.roomName).emit("update_stream_view", {
        isColumn: data.isColumn,
      });
    }
    catch (e: any) {
      console.log(e.message);
    }

  });


  socket.on("host_update_filters", async (data: any) => {
    try {
      const query = {roomName: data.roomName}
      const update = {filters: [data.levelFilters, data.difficulties]}
      await Room.findOneAndUpdate(query, update)
      io.to(data.roomName).emit("send_updated_filters", {
        level: data.levelFilters,
        difficulties: data.difficulties,
      });
    }
    catch (e: any) {
      console.log(e.message);
    }
   
  });

  

  socket.on("send_request", async (data: any) => {
    try {
      const currentRequestsAwait = await Room.findOne({roomName: data.roomName})
      const currentRequests = currentRequestsAwait["requests"]
      currentRequests.push(data.song)
      const query = {roomName: data.roomName}
      const update = {requests: currentRequests}
      await Room.findOneAndUpdate(query, update)
      io.to(data.roomName).emit("receive_request", { song: data.song });
      io.to(data.roomName).emit("update_requests", {
        requestList: currentRequests,
      });
    }
    catch (e: any) {
      console.log(e.message);
    }

  });





  socket.on("remove_from_requests", async (data: any) => {
    try {
      const currentRequestsAwait = await Room.findOne({roomName: data.roomName})
      const currentRequests = currentRequestsAwait["requests"]
      const query = {roomName: data.roomName}
      const update = {requests: currentRequests}
      await Room.findOneAndUpdate(query, update)
      io.to(data.roomName).emit("update_requests", {
        requestList: data.requestList,
      });
    }
    catch (e: any) {
      console.log(e.message);
    }
  });



  socket.on("send_cooldown", async (data: any) => {
    try {
      const query = {roomName: data.roomName}
      const update = {cooldown: data.cooldown}
      await Room.findOneAndUpdate(query, update)
      io.to(data.roomName).emit("update_cooldown", { cooldown: data.cooldown });
    }
    catch (e: any) {
      console.log(e.message);
    }

  });



});

server.listen(port, () => console.log("app is listening on port ", port));
