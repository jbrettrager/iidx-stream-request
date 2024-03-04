const mongoose = require("mongoose")
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

const roomSchema = new mongoose.Schema({
    roomName: String,
    songs: Array<Song>,
    cooldown: Number,
    isColumn: Boolean,
    requests: Array<Song>,
    hostKey: String,
    filters: Array
}, {timestamps: true})

export const Room = mongoose.model("Room", roomSchema)
