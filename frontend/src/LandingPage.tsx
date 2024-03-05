import React from "react";
import { useState, useEffect } from "react";
import { socket } from "./socket.js";
import { RouterProvider, useNavigate } from "react-router-dom";
import { LevelFilters, Difficulties, TextDb } from "./../../backend/types.ts";
import "./LandingPage.css";

export default function LandingPage() {
  const [csvData, setCsvData] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [failedCsvCheck, setFailedCsvCheck] = useState<boolean>(false);
  const [failedNameCheck, setFailedNameCheck] = useState<boolean>(false);
  const [roomList, setRoomList] = useState<Array<string>>([]);
  const [loadingTime, setLoadingTime] = useState<number>(2);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>("en");
  const textDatabase: TextDb = {
    hostPanelTitle: {
      en: "Create a new Request Room",
      jp: "新しいリクエストルームを作成する",
    },
    csvAreaTitle: {
      en: "Please Copy your CSV below:",
      jp: "CSVデータを下にコピーしてください：",
    },
    roomAreaTitle: {
      en: "Input a room name here:",
      jp: "ルーム名前を入力してください：",
    },
    landingButton: {
      en: "Create Request Room",
      jp: "ルームを作成する",
    },
    csvError: {
      en: "Entered CSV is invalid. Please enter a valid CSV file.",
      jp: "入力されたCSVデータが無効です。有効なCSVデータを入力してください。",
    },
    nameError: {
      en: "Room already exists with that name.",
      jp: "入力された名前がもう使用されている。",
    },
  };
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

  useEffect(() => {
    const loadingTimer = setInterval(() => {
      if (loadingTime === 0) {
        setIsLoading(false);
      } else {
        setLoadingTime(loadingTime - 1);
      }
    }, 1000);
    return () => {
      clearInterval(loadingTimer);
    };
  }, [loadingTime]);

  useEffect(() => {
    document.body.style.backgroundColor = "#272727";
  }, []);

  useEffect(() => {
    if (!isLoading) socket.emit("landing_lobby");
  }, [isLoading]);

  useEffect(() => {
    socket.on("lobby_join_rooms", onLobbyJoinRooms);
    socket.on("room_created", onRoomCreated);
    return () => {
      socket.off("lobby_join_rooms", onLobbyJoinRooms);
      socket.off("room_created", onRoomCreated);
    };
  }, [roomList]);

  function checkCsv(csvData: string) {
    let result = false;
    if (
      csvData.split("")[0] !== "バ" ||
      csvData.split("")[5] !== "," ||
      csvData.split("")[549] !== "時"
    )
    return result;
    else if (
      csvData.split(/\n/)[5].split(",")[1] === "GAMBOL" &&
      csvData.split(/\n/)[1].split(",")[1] === "22DUNK" &&
      csvData.split(/\n/)[2].split(",")[1] === "5.1.1."
    )
      result = true;
    return result;
  }

  function checkRoomName(): boolean {
    let result = true;
    if (roomList[0] === undefined) return result;
    else {
      for (let i = 0; i < roomList.length; i++) {
        if (roomList[i] === roomName) result = false;
      }
      return result;
    }
  }

  function onLobbyJoinRooms(data: any) {
    if (data.roomList === undefined) {
      return
    }
    else {
      setRoomList(data.roomList);
    }
  }

  function onRoomCreated(data: any) {
    setRoomList(data.roomList);
  }

  function createRoom() {
    let csvCheckResult = checkCsv(csvData);
    let roomNameCheckResult = checkRoomName();
    if (csvCheckResult && roomNameCheckResult) {
      socket.emit("create_room", {
        csvData,
        roomName,
        defaultLevelFilters,
        defaultDifficulties,
        cooldown: 60,
        isColumn: true,
      });
      const url = "/host/" + roomName + "-" + encryptUrl();
      navigate(url);
    } else if (csvCheckResult === false) setFailedCsvCheck(true);
    else if (roomNameCheckResult === false) setFailedNameCheck(true);
  }

  function encryptUrl(): string {
    let result: string = "";
    for (let i = 0; i < 30; i++) {
      let whichOne = Math.floor(Math.random() * 4);
      if (whichOne === 1)
        result += String.fromCharCode(
          Math.floor(Math.random() * (58 - 48) + 48)
        );
      if (whichOne === 2)
        result += String.fromCharCode(
          Math.floor(Math.random() * (91 - 65) + 65)
        );
      if (whichOne === 3)
        result += String.fromCharCode(
          Math.floor(Math.random() * (123 - 97) + 97)
        );
    }
    return result;
  }

  function handleCsvInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setCsvData(e.target.value);
  }

  function handleRoomInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    let newRoomName = e.target.value;
    let difference = newRoomName.split("")[newRoomName.length - 1];
    if (difference === "-") return;
    else setRoomName(newRoomName);
  }

  function handleLanguageChange(e: React.ChangeEvent<HTMLDivElement>) {
    setLanguage(e.target.textContent.toLowerCase());
  }

  return isLoading ? (
    <div>Loading...</div>
  ) : (
    <div className="landing-page none">
      <div className="host-panel">
        <div className="host-panel-title">
          {textDatabase["hostPanelTitle"][language]}
        </div>
        <div className="csv-area">
          <div className="csv-area-title">
            {textDatabase["csvAreaTitle"][language]}
          </div>
          <textarea
            id="csv-input"
            className="csv-input"
            value={csvData}
            onChange={(e) => handleCsvInput(e)}
          ></textarea>
        </div>
        <div className="room-area">
          <div>{textDatabase["roomAreaTitle"][language]}</div>
          <input
            type="text"
            id="room-name"
            className="create-room-name"
            value={roomName}
            onChange={(e) => handleRoomInput(e)}
          ></input>

          {roomName && (
            <button onClick={createRoom} className="landing-button">
              {textDatabase["landingButton"][language]}
            </button>
          )}
        </div>
        {failedCsvCheck && (
          <div className="csv-error">{textDatabase["csvError"][language]}</div>
        )}
        {failedNameCheck && (
          <div className="csv-error">{textDatabase["nameError"][language]}</div>
        )}
      </div>
      <div className="language-footer">
        <span className="material-symbols-outlined">language</span>
        <div className="languages">
          <div className="selectable-language" onClick={handleLanguageChange}>
            EN
          </div>
          <div className="selectable-language" onClick={handleLanguageChange}>
            JP
          </div>
        </div>
      </div>
    </div>
  );
}
