import React from "react";
import { useState, useEffect } from "react";
import  RequestedSong  from "./RequestedSong.tsx";
import { Song } from "./../../backend/types.ts";
import { socket } from "./socket.js";
import { useParams } from "react-router-dom";
import "./StreamView.css"

export default function StreamView() {
  const [isColumn, setIsColumn] = useState<boolean>(true);
  const [requestList, setRequestList] = useState<Array<Song>>([]);
  const [joinSuccessful, setJoinSuccessful] = useState<boolean>(false)
  const roomName = useParams().roomName?.split("-")[0]
  const hostKey = useParams().roomName?.split("-")[1]

  useEffect(() => {
    document.body.style.backgroundColor = "rgba(32, 0, 0, 0)";
    socket.emit("join_room_streamview", {
      roomName, hostKey
    });
  }, []);

  useEffect(() => {
    socket.on("initial_room_updates", onInitialRoomUpdatesRequests);
    socket.on("update_requests", onUpdateRequests);
    return () => {
      socket.off("update_requests", onUpdateRequests);
      socket.off("initial_room_updates", onInitialRoomUpdatesRequests);
    };
  }, [requestList]);

  useEffect(() => {
    socket.on("initial_room_updates", onInitialRoomUpdatesIsColumn)
    socket.on("update_stream_view", onUpdateStreamView)

    return () => {
        socket.off("initial_room_updates", onInitialRoomUpdatesIsColumn)
        socket.off("update_stream_view", onUpdateStreamView)
    }
  }, [isColumn])

  useEffect(() => {
    socket.on("room_join_streamview", onRoomJoinStreamview)

    return () => {
        socket.off("room_join_streamview", onRoomJoinStreamview)
    }
  }, [joinSuccessful])

  function onRoomJoinStreamview(data) {
    setJoinSuccessful(true)
    socket.emit("join_room", {roomName})
  }

  function onUpdateRequests(data) {
    setRequestList(data.requestList);
  }
  function onUpdateStreamView (data) {
    setIsColumn(data.isColumn)
  }
  function onInitialRoomUpdatesRequests(data) {
    setRequestList(data.requestList);
  }
  function onInitialRoomUpdatesIsColumn(data) {
    setIsColumn(data.isColumn)
  }

  function removeRequest(songInput: Song) {
    let newRequestList = requestList.filter(song => {
      if(song.title !== songInput.title) return song
    })
    setRequestList(newRequestList)
    socket.emit("remove_from_requests", {roomName, requestList: newRequestList})
  }


  return (
    !joinSuccessful ? <div className="failed-join">Room does not exist or link is incorrect.</div> : <div className={isColumn ? "stream-view column" : "stream-view row"}>
        {requestList[0] ? (requestList.map(song =>  <RequestedSong onClick={removeRequest} song={song} room={roomName} isStreamview={true} />)) : <div>Waiting for requests...</div>}
    </div>
  );
}
