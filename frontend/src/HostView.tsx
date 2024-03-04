import React, { MouseEventHandler, useEffect } from "react";
import { useState } from "react";
import { LevelFilters, Difficulties, Song, TextDb } from "../../backend/types.ts";
import { socket } from "./socket.js";
import RequestedSong from "./RequestedSong.tsx";
import { useParams } from "react-router-dom";
import "./HostView.css";

export default function HostView(props: any) {
  const [levelFilters, setLevelFilters] = useState<Array<LevelFilters>>([
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
  ]);
  const [difficulties, setDifficulties] = useState<Array<Difficulties>>([
    {
      beginner: false,
      normal: false,
      hyper: false,
      another: false,
      leggendaria: false,
    },
  ]);
  const [requestList, setRequestList] = useState<Array<Song>>([]);
  const [isColumn, setIsColumn] = useState<boolean>(true);
  const [cooldown, setCooldown] = useState<number>(60);
  const [loadingTime, setLoadingTime] = useState<number>(3)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [sentMessage, setSentMessage] = useState<boolean>(false);
  const [joinSuccessful, setJoinSuccessful] = useState<boolean>(false)
  const [sentMessageTimer, setSentMessageTimer] = useState<number>(0);
  const [currentCooldown, setCurrentCooldown] = useState<number>(cooldown);
  const [language, setLanguage] = useState<string>("en");
  const textDatabase: TextDb = {
    headerHostTitle: {
      en: "Hosting",
      jp: "主催中"
    },
    headerMessage: {
      en: "Please send the URL below to allow others to send requests to your room:",
      jp: "他の人がこのルームにリクエストを送信できるように下にあるURLを送信してください："
    },
    StreamviewMessage: {
      en: "Please use this URL in OBS",
      jp: "このURLをOBSで使用してください："
    },
    filtersTitle: {
      en: "Control Panel",
      jp: "コントロールパネル"
    },
    sendButton: {
      en: "Send Updated Filters",
      jp: "アップデートされたフィルターを送信する"
    },
    cooldownAreaTitle: {
      en: "Current Cooldown Timer:",
      jp: "現在のクールダウンタイマー"
    },
    setCooldownArea: {
      en: "Change Cooldown",
      jp: "クールダウンを変更する"
    },
    secondsText: {
      en: "seconds",
      jp: "秒"
    },
    cooldownButton: {
      en: "Set Cooldown",
      jp: "クールダウンを設定する"
    },
    isColumnRow: {
      en: "Request Display: Row", 
      jp: "リクエスト表示：行"
    },
    isColumnColumn:{
      en: "Request Display: Column",
      jp: "リクエスト表示：カラム"
    },
    filtersSent: {
      en: "Filters Sent",
      jp: "フィルターを送信した"
    },
    numberAboveMax: {
      en: "Number above max",
      jp: "最大値より上の数字"
    },
    invalidNumber: {
      en: "Please Enter a Valid Number",
      jp: "有効な数字を入力してください"
    }


  }
  const roomName = useParams().roomName?.split("-")[0];
  const hostKey = useParams().roomName?.split("-")[1];
  let guestUrl = "https://iidxrequestrooms.onrender.com/guest/";
  let streamViewUrl = "https://iidxrequestrooms.onrender.com/streamview/";
  guestUrl += roomName;
  streamViewUrl += useParams().roomName;


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
    if(!isLoading)
    socket.emit("join_room_host", { roomName, hostKey });
  }, [isLoading])
  
  useEffect(() => {
    socket.on("initial_room_updates", onInitialRoomUpdatesRequests);
    socket.on("receive_request", onReceiveRequest);
    socket.on("update_requests", onUpdateRequests);
    return () => {
      socket.off("initial_room_updates", onInitialRoomUpdatesRequests);
      socket.off("receive_request", onReceiveRequest);
      socket.off("update_requests", onUpdateRequests);
    };
  }, [requestList]);

  useEffect(() => {
    socket.on("initial_room_updates", onInitialRoomUpdatesCooldown);
    socket.on("update_cooldown", onUpdateCooldown);
    return () => {
      socket.off("initial_room_updates", onInitialRoomUpdatesCooldown);
      socket.off("update_cooldown", onUpdateCooldown);
    };
  }, [cooldown]);

  useEffect(() => {
    socket.on("initial_room_updates", onInitialRoomUpdatesLevelFilters);
    socket.on("send_updated_filters", onSendUpdatedFiltersLevelFilters);
    return () => {
      socket.off("initial_room_updates", onInitialRoomUpdatesLevelFilters);
      socket.off("send_updated_filters", onSendUpdatedFiltersLevelFilters);
    };
  }, [levelFilters]);

  useEffect(() => {
    socket.on("initial_room_updates", onInitialRoomUpdatesDifficulties);
    socket.on("send_updated_filters", onSendUpdatedFiltersDifficulties);
    return () => {
      socket.off("initial_room_updates", onInitialRoomUpdatesDifficulties);
      socket.off("send_updated_filters", onSendUpdatedFiltersDifficulties);
    };
  }, [difficulties]);

  useEffect(() => {
    socket.on("initial_room_updates", onInitialRoomUpdatesIsColumn);

    return () => {
      socket.off("initial_room_updates", onInitialRoomUpdatesIsColumn);
    };
  }, [isColumn]);

  useEffect(() => {
    socket.on("room_join_host", onRoomJoinHost);

    return () => {
      socket.off("room_join_host", onRoomJoinHost);
    };
  }, [joinSuccessful]);

  useEffect(() => {
    document.body.style.backgroundColor = "#090020";
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (sentMessageTimer === 0) {
        setSentMessage(false);
      } else {
        setSentMessageTimer(sentMessageTimer - 1);
      }
    }, 100);
    return () => {
      clearInterval(timer);
    };
  }, [sentMessageTimer]);

  function onRoomJoinHost(data) {
    setJoinSuccessful(data.join)
    socket.emit("join_room", {roomName})
  }

  function onInitialRoomUpdatesLevelFilters(data) {
    setLevelFilters(data.filters[0]);
  }
  function onInitialRoomUpdatesIsColumn(data) {
    setIsColumn(data.isColumn);
  }
  function onInitialRoomUpdatesCooldown(data) {
    setCooldown(data.cooldown);
  }
  function onInitialRoomUpdatesRequests(data) {
    setRequestList(data.requestList);
  }
  function onInitialRoomUpdatesDifficulties(data) {
    setDifficulties(data.filters[1]);
  }
  function onUpdateCooldown(data) {
    setCooldown(data.cooldown);
  }
  function onUpdateStreamView(data) {
    setIsColumn(data.isColumn);
  }
  function onSendUpdatedFiltersLevelFilters(data) {
    setLevelFilters(data.level);
  }
  function onSendUpdatedFiltersDifficulties(data) {
    setDifficulties(data.difficulties);
  }
  function onUpdateRequests(data) {
    setRequestList(data.requestList);
  }

  function sendUpdatedFilters(levelFilters, difficulties, roomName) {
    socket.emit("host_update_filters", {
      levelFilters,
      difficulties,
      roomName,
    });
    setSentMessageTimer(8);
    setSentMessage(true);
  }

  function onReceiveRequest(data) {
    let newRequestList = [...requestList];
    newRequestList.push(data.song);
    setRequestList(newRequestList);
  }

  function handleClickLevels(e: React.MouseEvent<HTMLDivElement>) {
    let target = e.currentTarget.className.split(" ");
    let newLevelFilters = [...levelFilters];
    if (target[2] === "one") {
      newLevelFilters[0][1] = !newLevelFilters[0][1];
    } else if (target[2] === "two") {
      newLevelFilters[0][2] = !newLevelFilters[0][2];
    } else if (target[2] === "three") {
      newLevelFilters[0][3] = !newLevelFilters[0][3];
    } else if (target[2] === "four") {
      newLevelFilters[0][4] = !newLevelFilters[0][4];
    } else if (target[2] === "five") {
      newLevelFilters[0][5] = !newLevelFilters[0][5];
    } else if (target[2] === "six") {
      newLevelFilters[0][6] = !newLevelFilters[0][6];
    } else if (target[2] === "seven") {
      newLevelFilters[0][7] = !newLevelFilters[0][7];
    } else if (target[2] === "eight") {
      newLevelFilters[0][8] = !newLevelFilters[0][8];
    } else if (target[2] === "nine") {
      newLevelFilters[0][9] = !newLevelFilters[0][9];
    } else if (target[2] === "ten") {
      newLevelFilters[0][10] = !newLevelFilters[0][10];
    } else if (target[2] === "eleven") {
      newLevelFilters[0][11] = !newLevelFilters[0][11];
    } else if (target[2] === "twelve") {
      newLevelFilters[0][12] = !newLevelFilters[0][12];
    }
    setLevelFilters(newLevelFilters);
  }
  function handleClickDifficulties(e: React.MouseEvent<HTMLDivElement>) {
    let newDifficulties = [...difficulties];
    let target = e.currentTarget.className.split(" ")[1].split("-")[0];
    console.log(target);
    if (target === "beginner") {
      newDifficulties[0]["beginner"] = !newDifficulties[0]["beginner"];
    } else if (target === "normal") {
      newDifficulties[0]["normal"] = !newDifficulties[0]["normal"];
    } else if (target === "hyper") {
      newDifficulties[0]["hyper"] = !newDifficulties[0]["hyper"];
    } else if (target === "another") {
      newDifficulties[0]["another"] = !newDifficulties[0]["another"];
    } else if (target === "leggendaria") {
      newDifficulties[0]["leggendaria"] = !newDifficulties[0]["leggendaria"];
    }
    setDifficulties(newDifficulties);
  }

  function removeRequest(songInput: Song, diff: string) {
    let newRequestList = requestList.filter((song) => {
      if (song.title !== songInput.title) return song
      else {
        if(song.requestDiff !== diff) return song
      }
    });
    setRequestList(newRequestList);
    socket.emit("remove_from_requests", {
      roomName,
      requestList: newRequestList,
    });
  }

  function handleCooldownChange(e: React.ChangeEvent<HTMLInputElement>) {
    console.log(e.target.value);
    setCooldown(parseInt(e.target.value));
  }

  function handleIsColumn() {
    const newIsColumn = !isColumn;
    setIsColumn(newIsColumn);
    socket.emit("stream_display_change", { isColumn: newIsColumn, roomName });
  }

  function sendCooldown() {
    socket.emit("send_cooldown", { roomName, cooldown });
    setCurrentCooldown(cooldown);
  }

  function handleLanguageChange(e: React.ChangeEvent<HTMLDivElement>) {
    setLanguage(e.target.textContent.toLowerCase())
  }

  return (
    isLoading ? <div>Loading...</div> : (!joinSuccessful ? <div className="none">Host link is incorrect or room does not exist.</div> : 
    <div className="host-view none">
      <div className="header-host">
        <div className="header-host-title">{textDatabase['headerHostTitle'][language]}</div>
        <div className="room-name">{roomName}</div>
      </div>
      <div className="url-area">
        <div className="header-message">
          {textDatabase['headerMessage'][language]}
        </div>
        <input className="guest-url" value={guestUrl}></input>
        <div className="header-message">{textDatabase["StreamviewMessage"][language]}</div>
        <input className="guest-url" value={streamViewUrl}></input>
        {requestList[0] &&
          (isColumn ? (
            <div onClick={handleIsColumn} className="diamond-is-column">
              {textDatabase['isColumnColumn'][language]}
            </div>
          ) : (
            <div onClick={handleIsColumn} className="diamond-is-column">
              {textDatabase['isColumnRow'][language]}
            </div>
          ))}
      </div>
      <div className="filters host">
        <div className="filters-title">{textDatabase['filtersTitle'][language]}</div>
        <div className="button-container">
          <div
            className={
              levelFilters[0][1]
                ? "diamond level one active"
                : "diamond level one"
            }
            onClick={handleClickLevels}
          >
            <div className="inner-text">1</div>
          </div>
          <div
            className={
              levelFilters[0][2]
                ? "diamond level two active"
                : "diamond level two"
            }
            onClick={handleClickLevels}
          >
            <div className="inner-text">2</div>
          </div>
          <div
            className={
              levelFilters[0][3]
                ? "diamond level three active"
                : "diamond level three"
            }
            onClick={handleClickLevels}
          >
            <div className="inner-text">3</div>
          </div>
          <div
            className={
              levelFilters[0][4]
                ? "diamond level four active"
                : "diamond level four"
            }
            onClick={handleClickLevels}
          >
            <div className="inner-text">4</div>
          </div>
          <div
            className={
              levelFilters[0][5]
                ? "diamond level five active"
                : "diamond level five"
            }
            onClick={handleClickLevels}
          >
            <div className="inner-text">5</div>
          </div>
          <div
            className={
              levelFilters[0][6]
                ? "diamond level six active"
                : "diamond level six"
            }
            onClick={handleClickLevels}
          >
            <div className="inner-text">6</div>
          </div>
        </div>
        <div className="button-container">
          <div
            className={
              levelFilters[0][7]
                ? "diamond level seven active"
                : "diamond level seven"
            }
            onClick={handleClickLevels}
          >
            <div className="inner-text">7</div>
          </div>
          <div
            className={
              levelFilters[0][8]
                ? "diamond level eight active"
                : "diamond level eight"
            }
            onClick={handleClickLevels}
          >
            <div className="inner-text">8</div>
          </div>
          <div
            className={
              levelFilters[0][9]
                ? "diamond level nine active"
                : "diamond level nine"
            }
            onClick={handleClickLevels}
          >
            <div className="inner-text">9</div>
          </div>
          <div
            className={
              levelFilters[0][10]
                ? "diamond level ten active"
                : "diamond level ten"
            }
            onClick={handleClickLevels}
          >
            <div className="inner-text">10</div>
          </div>
          <div
            className={
              levelFilters[0][11]
                ? "diamond level eleven active"
                : "diamond level eleven"
            }
            onClick={handleClickLevels}
          >
            <div className="inner-text">11</div>
          </div>
          <div
            className={
              levelFilters[0][12]
                ? "diamond level twelve active"
                : "diamond level twelve"
            }
            onClick={handleClickLevels}
          >
            <div className="inner-text">12</div>
          </div>
        </div>
        <div className="button-container diff">
          <div
            className={
              difficulties[0]["beginner"]
                ? "diamond beginner-button active"
                : "diamond beginner-button"
            }
            onClick={handleClickDifficulties}
          >
            <div className="inner-text">BEGINNER</div>
          </div>
          <div
            className={
              difficulties[0]["normal"]
                ? "diamond normal-button active"
                : "diamond normal-button"
            }
            onClick={handleClickDifficulties}
          >
            <div className="inner-text">NORMAL</div>
          </div>
          <div
            className={
              difficulties[0]["hyper"]
                ? "diamond hyper-button active"
                : "diamond hyper-button"
            }
            onClick={handleClickDifficulties}
          >
            <div className="inner-text">HYPER</div>
          </div>
        </div>
        <div className="button-container diff">
          <div
            className={
              difficulties[0]["another"]
                ? "diamond another-button active"
                : "diamond another-button"
            }
            onClick={handleClickDifficulties}
          >
            <div className="inner-text">ANOTHER</div>
          </div>
          <div
            className={
              difficulties[0]["leggendaria"]
                ? "diamond leggendaria-button active"
                : "diamond leggendaria-button"
            }
            onClick={handleClickDifficulties}
          >
            <div className="inner-text">LEGGENDARIA</div>
          </div>
        </div>

        {!sentMessage ? (
          <div
            className="diamond-send"
            onClick={() =>
              sendUpdatedFilters(levelFilters, difficulties, roomName)
            }
          >
            <div>{textDatabase["sendButton"][language]}</div>
          </div>
        ) : (
          <div className="diamond-sent">
            <div>{textDatabase["filtersSent"][language]}</div>
          </div>
        )}
        <div className="cooldown-area">
          <div>{textDatabase["cooldownAreaTitle"][language]}</div> 
          <div className="cooldown-number">{currentCooldown}</div> 
          <div>{textDatabase["secondsText"][language]}</div>
          <div className="set-cooldown">{textDatabase['setCooldownArea'][language]}
          <input
            className="number-input"
            type="number"
            value={cooldown}
            onChange={handleCooldownChange}
          ></input>
          <div>{textDatabase["secondsText"][language]}</div>
          </div>
          {cooldown ? 
            ((cooldown > 10800 ? <div className="diamond-cooldown cooldown-error">{textDatabase["numberAboveMax"][language]}</div> : <div className="diamond-cooldown" onClick={sendCooldown}>{textDatabase['cooldownButton'][language]}</div>
          )) : (
            <div className="diamond-cooldown cooldown-error">{textDatabase['invalidNumber'][language]}</div>
          )}
        </div>
      </div>
      <div className="sent-requests">
        {requestList[0] &&
          requestList.map((song: Song) => {
            return (
              <RequestedSong
                onClick={removeRequest}
                song={song}
                room={roomName}
                isStreamview={false}
              />
            );
          })}
      </div>
      <div className="language-footer">
        <span className="material-symbols-outlined">language</span>
        <div className="languages">
          <div className="selectable-language" onClick={handleLanguageChange}>EN</div>
          <div className="selectable-language" onClick={handleLanguageChange}>JP</div>
        </div>
      </div>
    </div>)
  );
}
