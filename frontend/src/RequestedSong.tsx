import React from "react";
import "./requestedsongarea.css";

export default function RequestedSong(props: any) {
  let songAreaClass = "";
  let difficulty = "";
  let difficultyNumber = 0;
  let isLeggendaria = false;
  let isEpolis = false;

  if(props.song.version === "1st&substream") {
    songAreaClass += "first"
  }
  else if(props.song.version === "2nd style") {
    songAreaClass += "second"
  }
  else if(props.song.version === "3rd style") {
    songAreaClass += "third"
  }
  else if(props.song.version === "4th style") {
    songAreaClass += "fourth"
  }
  else if(props.song.version === "5th style") {
    songAreaClass += "fifth"
  }
  else if(props.song.version === "6th style") {
    songAreaClass += "sixth"
  }
  else if(props.song.version === "7th style") {
    songAreaClass += "seventh"
  }
  else if(props.song.version === "8th style") {
    songAreaClass += "eighth"
  }
  else if(props.song.version === "9th style") {
    songAreaClass += "ninth"
  }
  else if(props.song.version === "10th style") {
    songAreaClass += "tenth"
  }
  else {
    songAreaClass += props.song.version
  }

  if (props.song.requestDiff === "beginner") {
    songAreaClass += " requested-song beginner";
    difficulty = "BEGINNER";
    difficultyNumber = props.song.beginnerDiff;
  }
  if (props.song.requestDiff === "normal") {
    songAreaClass += " requested-song normal";
    difficulty = "NORMAL";
    difficultyNumber = props.song.normalDiff;
  }
  if (props.song.requestDiff === "hyper") {
    songAreaClass += " requested-song hyper";
    difficulty = "HYPER";
    difficultyNumber = props.song.hyperDiff;
  }
  if (props.song.requestDiff === "another") {
    songAreaClass += " requested-song another";
    difficulty = "ANOTHER";
    difficultyNumber = props.song.anotherDiff;
  }
  if (props.song.requestDiff === "leggendaria") {
    songAreaClass += " requested-song leggendaria";
    difficulty = "LEGGENDARIA";
    difficultyNumber = props.song.leggendariaDiff;
    isLeggendaria = true;
  }
  if (props.song.version === "EPOLIS") {
    isEpolis = true;
  }
  return (
    <div className={songAreaClass} onClick={(song) => props.onClick(props.song, props.song.requestDiff)}>
      <div className="diff-number">{difficultyNumber}</div>
      <div className={
          isLeggendaria
            ? "song-name-leggendaria"
            : isEpolis
            ? "song-name-epolis"
            : "song-name"
        }>{props.song.title}</div>
    </div>
  );
}