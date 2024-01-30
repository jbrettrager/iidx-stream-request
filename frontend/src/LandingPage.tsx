import React from "react";
import { useState } from "react";
import { socket } from "./socket.js";
import { useNavigate } from "react-router-dom";
import { LevelFilters, Difficulties } from "./../../backend/types.ts";
import "./LandingPage.css";

export default function LandingPage() {
  const [csvData, setCsvData] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [failedCsvCheck, setFailedCsvCheck] = useState<boolean>(false)
  const navigate = useNavigate();
  const defaultLevelFilters: Array<LevelFilters> = [
    {
      "1": false,
      "2": false,
      "3": false,
      "4": false,
      "5": false,
      "6": false,
      "7": false,
      "8": false,
      "9": false,
      "10": false,
      "11": false,
      "12": false,
    },
  ];
  const defaultDifficulties: Array<Difficulties> = [
    {
      beginner: false,
      normal: false,
      hyper: false,
      another: false,
      leggendaria: false,
    },
  ];

  function checkCsv(csvData: string) {
    let result = false
    console.log(csvData.split(/\n/)[817].split(",")[1])
    if (csvData.split(/\n/)[5].split(",")[1] === "GAMBOL" && csvData.split(/\n/)[160].split(",")[1] === "quasar" && csvData.split(/\n/)[817].split(",")[1] === "Line 4 Ruin") result = true
    return result;
  }

  function createRoom() {
     if (checkCsv(csvData)) {
    socket.emit("create_room", {
      csvData,
      roomName,
      defaultLevelFilters,
      defaultDifficulties,
      cooldown: 60,
      isColumn: true
    });
    const url = "/host/" + roomName + "-" + encryptUrl();
    navigate(url);
  }
  else setFailedCsvCheck(true)
  }

  function encryptUrl(): string {
    let result: string = ""
    for (let i = 0; i < 30; i++) {
      let whichOne = Math.floor(Math.random() * (4))
      if (whichOne === 1) 
      result += String.fromCharCode(Math.floor(Math.random() * (58 - 48) + 48))
      if (whichOne === 2) 
      result += String.fromCharCode(Math.floor(Math.random() * (91 - 65) + 65))
      if (whichOne === 3) 
      result += String.fromCharCode(Math.floor(Math.random() * (123 - 97) + 97))
    }
    console.log(result)
    return result
  }

  function handleCsvInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setCsvData(e.target.value);
  }

  function handleRoomInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setRoomName(e.target.value);
  }

  return (
    <div className="landing-page">
      <div className="host-panel">
        <div className="host-panel-title">Host a new Request Room</div>
        <div className="csv-area">
            <div className="csv-area-title">Please Copy your CSV below:</div>
            <textarea
              id="csv-input"
              className="csv-input"
              value={csvData}
              onChange={(e) => handleCsvInput(e)}
            ></textarea>
        </div>
        {failedCsvCheck && <div className="csv-error">Entered CSV is invalid. Please enter a valid CSV file.</div>}
        <div className="room-area">
          <div>Input a room name here:</div>
          <input
          type="text"
            id="room-name"
            className="create-room-name"
            value={roomName}
            onChange={(e) => handleRoomInput(e)}
          ></input>

         {roomName && <button onClick={createRoom} className="landing-button">
            Create Request Room
          </button>}
        </div>
      </div>
    </div>
  );
}
