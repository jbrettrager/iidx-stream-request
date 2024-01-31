import React, { useEffect } from "react";
import { useState } from "react";
import { LevelFilters, Difficulties, Song } from "../../backend/types.ts";
import { socket } from "./socket.js";
import "./Request.css";

export default function Request(props: any) {
  const levelFilters: Array<LevelFilters> = props.filter[0];
  const difficulties: Array<Difficulties> = props.filter[1];
  const roomName = props.room;
  const cooldown = props.cooldown[0]
  const isOnCooldown = props.cooldown[1]
  const setIsOnCooldown = props.cooldown[2]
  const setCooldownRemaining = props.cooldown[3]
  const cooldownRemaining = props.cooldown[4]
  const requestList = props.request
  let requestClass = "";
  const [difficultyClass, setDifficultyClass] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [currentRequestedSongs, setCurrentRequestedSongs] = useState<Array<Song>>([])
  const [sentMessage, setSentMessage] = useState<boolean>(false)
  const [focused, setFocused] = useState<boolean>(false)
  let isEpolis = false;

  function checkExisting(requestList: Array<Song>, song: Song, requestDiff: string): boolean {
    let found = false;
    if (requestList === undefined || requestList.length === 0) return found;
    else {
      for (let i = 0; i < requestList.length; i++) {
        if (
          song.title === requestList[i].title &&
          requestDiff === requestList[i].requestDiff
        )
          found = true;
      }
      return found;
    }
  }

  if (props.song.version === "1st&substream") {
    requestClass += "first" + " request";
  } else if (props.song.version === "2nd style") {
    requestClass += "second" + " request";
  } else if (props.song.version === "3rd style") {
    requestClass += "third" + " request";
  } else if (props.song.version === "4th style") {
    requestClass += "fourth" + " request";
  } else if (props.song.version === "5th style") {
    requestClass += "fifth" + " request";
  } else if (props.song.version === "6th style") {
    requestClass += "sixth" + " request";
  } else if (props.song.version === "7th style") {
    requestClass += "seventh" + " request";
  } else if (props.song.version === "8th style") {
    requestClass += "eighth" + " request";
  } else if (props.song.version === "9th style") {
    requestClass += "ninth" + " request";
  } else if (props.song.version === "10th style") {
    requestClass += "tenth" + " request";
  } else {
    requestClass += props.song.version + " request";
  }

  function sendRequest(diff: string) {
    props.song.requestDiff = diff;
    socket.emit("send_request", {
      song: props.song,
      difficulty: diff,
      room: roomName,
    });
    setIsOnCooldown(true)
    setCooldownRemaining(cooldown)
  }

  function updateDifficulty(difficulty: string) {
    if (difficulty === "beginner") {
      setDifficultyClass(" beginner picked");
    }
    if (difficulty === "normal") {
      setDifficultyClass(" normal picked");
    }
    if (difficulty === "hyper") {
      setDifficultyClass(" hyper picked");
    }
    if (difficulty === "another") {
      setDifficultyClass(" another picked");
    }
    if (difficulty === "leggendaria") {
      setDifficultyClass(" leggendaria picked");
    }
  }

  function handleDifficulty(e: React.MouseEvent<HTMLImageElement>) {
    let difficulty = e.currentTarget.className.split(" ")[1].split("-")[0];
    updateDifficulty(difficulty);
    setSelectedDifficulty(difficulty);
  }

  function checkSelectable(diffNumber: string): boolean {
    let result = false;
    if (levelFilters[0][diffNumber]) result = true;
    return result;
  }

  function handleOnClickRequest(e: React.MouseEvent<HTMLDivElement>) {
    if(selectedDifficulty !== "")
    setSelectedDifficulty("")
  }

  function handleFocused(e: React.MouseEvent<HTMLDivElement>) {
    setFocused(!focused)
  }

  if (props.song.version === "EPOLIS") {
    isEpolis = true;
  }

  return (
    <div className={requestClass + difficultyClass} onClick={handleFocused}>
      <div className="title-artist-diff">
        <div className="title-artist-box">
          <div
            className={
              isEpolis
                ? "request-name epolis"
                : selectedDifficulty === "leggendaria"
                ? "request-name leggendaria"
                : "request-name"
            }
          >
            {props.song.title}
          </div>
          <div className="artist-name">{props.song.artist}</div>
        </div>

      </div>
      <div className="selectable-difficulties">
      {difficulties[0]["beginner"] &&
          props.song.beginnerDiff !== "0" &&
          checkSelectable(props.song.beginnerDiff) && (
            <div className={!focused ? "diff-and-level beginner unfocused" : "diff-and-level beginner-focused"}>
            {focused && <div>Send Request?
              </div>}
          <div className="level-number">{props.song.beginnerDiff}</div>
        <div
          className={focused ? "beginner-select diff-button highlight" : "beginner-select diff-button unhighlight" }
        ></div>
        {focused && (!checkExisting(requestList, props.song, "beginner") ? 
            (!isOnCooldown ? <div className="send-request-button" onClick={() => sendRequest("beginner")}>Send</div> : <div className="on-cooldown"><div>On Cooldown</div><div>{cooldownRemaining} seconds left</div></div>) : <div>Already Requested</div>)}
        </div>
          )}
      {difficulties[0]["normal"] &&
          props.song.normalDiff !== "0" &&
          checkSelectable(props.song.normalDiff) && (
            <div className={!focused ? "diff-and-level normal unfocused" : "diff-and-level normal-focused"}>
            {focused && <div>Send Request?
              </div>}
          <div className="level-number">{props.song.normalDiff}</div>
        <div
          className={focused ? "normal-select diff-button highlight" : "normal-select diff-button unhighlight" }
        ></div>
        {focused && (!checkExisting(requestList, props.song, "normal") ? 
            (!isOnCooldown ? <div className="send-request-button" onClick={() => sendRequest("normal")}>Send</div> : <div className="on-cooldown"><div>On Cooldown</div><div>{cooldownRemaining} seconds left</div></div>) : <div>Already Requested</div>)}
        </div>
          )}
      {difficulties[0]["hyper"] &&
          props.song.hyperDiff !== "0" &&
          checkSelectable(props.song.hyperDiff) && (
            <div className={!focused ? "diff-and-level hyper unfocused" : "diff-and-level hyper-focused"}>
            {focused && <div>Send Request?
              </div>}
          <div className="level-number">{props.song.hyperDiff}</div>
        <div
          className={focused ? "hyper-select diff-button highlight" : "hyper-select diff-button unhighlight" }
        ></div>
        {focused && (!checkExisting(requestList, props.song, "hyper") ? 
            (!isOnCooldown ? <div className="send-request-button" onClick={() => sendRequest("hyper")}>Send</div> : <div className="on-cooldown"><div>On Cooldown</div><div>{cooldownRemaining} seconds left</div></div>) : <div>Already Requested</div>)}
        </div>
          )}
      {difficulties[0]["another"] &&
          props.song.anotherDiff !== "0" &&
          checkSelectable(props.song.anotherDiff) && (
            <div className={!focused ? "diff-and-level another unfocused" : "diff-and-level another-focused"}>
            {focused && <div>Send Request?
              </div>}
          <div className="level-number">{props.song.anotherDiff}</div>
        <div
          className={focused ? "another-select diff-button highlight" : "another-select diff-button unhighlight" }
        ></div>
        {focused && (!checkExisting(requestList, props.song, "another") ? 
            (!isOnCooldown ? <div className="send-request-button" onClick={() => sendRequest("another")}>Send</div> : <div className="on-cooldown"><div>On Cooldown</div><div>{cooldownRemaining} seconds left</div></div>) : <div>Already Requested</div>)}
        </div>
          )}
      {difficulties[0]["leggendaria"] &&
          props.song.leggendariaDiff !== "0" &&
          checkSelectable(props.song.leggendariaDiff) && (
            <div className={!focused ? "diff-and-level leggendaria unfocused" : "diff-and-level leggendaria-focused"}>
            {focused && <div>Send Request?
              </div>}
          <div className="level-number">{props.song.leggendariaDiff}</div>
        <div
          className={focused ? "leggendaria-select diff-button highlight" : "leggendaria-select diff-button unhighlight" }
        ></div>
        {focused && (!checkExisting(requestList, props.song, "leggendaria") ? 
            (!isOnCooldown ? <div className="send-request-button" onClick={() => sendRequest("leggendaria")}>Send</div> : <div className="on-cooldown"><div>On Cooldown</div><div>{cooldownRemaining} seconds left</div></div>) : <div>Already Requested</div>)}
        </div>
          )}
          </div>
    
    </div>
  );
}
