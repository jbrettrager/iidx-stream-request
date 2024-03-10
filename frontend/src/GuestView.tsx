import React from "react";
import { useState, useEffect } from "react";
import { socket } from "./socket.js";
import {
  LevelFilters,
  Difficulties,
  Song,
  StyleFilters,
  TextDb
} from "./../../backend/types.ts";
import Request from "./Request.tsx";
import { useParams } from "react-router-dom";
import "./GuestView.css";
const firstBanner = require("./img/logos/1.png");
const secondBanner = require("./img/logos/2.png");
const thirdBanner = require("./img/logos/3.png");
const fourthBanner = require("./img/logos/4.png");
const fifthBanner = require("./img/logos/5.png");
const sixthBanner = require("./img/logos/6.png");
const seventhBanner = require("./img/logos/7.png");
const eighthBanner = require("./img/logos/8.png");
const ninthBanner = require("./img/logos/9.png");
const tenthBanner = require("./img/logos/10.png");
const iidxRedBanner = require("./img/logos/11.png");
const happySkyBanner = require("./img/logos/12.png");
const distortedBanner = require("./img/logos/13.png");
const goldBanner = require("./img/logos/14.png");
const djTroopersBanner = require("./img/logos/15.png");
const empressBanner = require("./img/logos/16.png");
const siriusBanner = require("./img/logos/17.png");
const resortAnthemBanner = require("./img/logos/18.png");
const lincleBanner = require("./img/logos/19.png");
const tricoroBanner = require("./img/logos/20.png");
const spadaBanner = require("./img/logos/21.png");
const pendualBanner = require("./img/logos/22.png");
const copulaBanner = require("./img/logos/23.png");
const sinobuzBanner = require("./img/logos/24.png");
const cannonBallersBanner = require("./img/logos/25.png");
const rootageBanner = require("./img/logos/26.png");
const heroicVerseBanner = require("./img/logos/27.png");
const bistroverBanner = require("./img/logos/28.png");
const castHourBanner = require("./img/logos/29.png");
const residentBanner = require("./img/logos/30.png");
const epolisBanner = require("./img/logos/31.png");

export default function GuestView(props: any) {
  const [songlist, setSonglist] = useState<Array<Song>>([]);
  const [originalList, setOriginalList] = useState<Array<Song>>([]);
  const [displayNumber, setDisplayNumber] = useState<number>(10);
  const [cooldown, setCooldown] = useState<number>(60);
  const [allFiltersChecked, setAllFiltersChecked] = useState<boolean>(true);
  const [noFiltersChecked, setNoFiltersChecked] = useState<boolean>(false);
  const [joinSuccessful, setJoinSuccessful] = useState<boolean>(false)
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [isOnCooldown, setIsOnCooldown] = useState<boolean>(false);
  const [pageNumber, setPageNumber] = useState<number>(0);
  const [language, setLanguage] = useState<string>("en");
  const [requestList, setRequestList] = useState<Array<Song>>([]);
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
  const [styleFilters, setStyleFilters] = useState<Array<StyleFilters>>([
    {
      "1st&substream": true,
      "2nd style": true,
      "3rd style": true,
      "4th style": true,
      "5th style": true,
      "6th style": true,
      "7th style": true,
      "8th style": true,
      "9th style": true,
      "10th style": true,
      "IIDX RED": true,
      "HAPPY SKY": true,
      DistorteD: true,
      GOLD: true,
      "DJ TROOPERS": true,
      EMPRESS: true,
      SIRIUS: true,
      "Resort Anthem": true,
      Lincle: true,
      tricoro: true,
      SPADA: true,
      PENDUAL: true,
      copula: true,
      SINOBUZ: true,
      "CANNON BALLERS": true,
      Rootage: true,
      "HEROIC VERSE": true,
      BISTROVER: true,
      CastHour: true,
      RESIDENT: true,
      EPOLIS: true,
    },
  ]);
  const [searchText, setSearchText] = useState<string>("");
  const roomName = useParams().roomName;
  const textDatabase: TextDb = {
    guestTitle: {
      en: "Taking Requests for:",
      jp: "リクエスト受付中"
    },
    filtersTitle: {
      en: "Currently Active Filters:",
      jp: "設定されたフィルター："
    },
    currentCooldown: {
      en: "Current Cooldown Timer: ",
      jp: "現在のクールダウンタイマー： "
    },
    secondsText: {
      en: "seconds",
      jp: "秒"
    },
    checkAll: {
      en: "Check All Styles", 
      jp: "全てチェックする"
    },
    uncheckAll: {
      en: "Uncheck All Styles",
      jp: "全てチェックを外す"
    }, 
    searchTitle: {
      en: "Search by Song Name:", 
      jp: "曲名で検索："
    },
    numberAvailable: {
      en: "Number of Songs Available to Request", 
      jp: "リクエスト可能な曲数"
    },
    pageText: {
      en: "Page",
      jp: "Page"
    }

  }

  useEffect(() => {
    const cooldownTimer = setInterval(() => {
      if (cooldownRemaining === 0) {
        setIsOnCooldown(false);
      } else {
        setCooldownRemaining(cooldownRemaining - 1);
      }
    }, 1000);
    return () => {
      clearInterval(cooldownTimer);
    };
  }, [cooldownRemaining]);

  useEffect(() => {
    socket.on("initial_room_updates", onInitialRoomUpdatesOriginal);
    socket.on("send_updated_filters", onSendUpdatedFiltersOriginal);
    return () => {
      socket.off("initial_room_updates", onInitialRoomUpdatesOriginal);
      socket.off("send_updated_filters", onSendUpdatedFiltersOriginal);
    };
  }, [originalList]);

  useEffect(() => {
    socket.on("initial_room_updates", onInitialRoomUpdatesSonglist);
    socket.on("send_updated_filters", onSendUpdatedFiltersSonglist);
    return () => {
      socket.off("initial_room_updates", onInitialRoomUpdatesSonglist);
      socket.off("send_updated_filters", onSendUpdatedFiltersSonglist);
    };
  }, [songlist]);

  useEffect(() => {
    socket.on("initial_room_updates", onInitialRoomUpdatesRequests);
    socket.on("update_requests", onUpdateRequests);
    return () => {
      socket.off("update_requests", onUpdateRequests);
      socket.off("initial_room_updates", onInitialRoomUpdatesRequests);
    };
  }, [requestList]);

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
    socket.on("initial_room_updates", onInitialRoomUpdatesCooldown);
    socket.on("update_cooldown", onUpdateCooldown);
    return () => {
      socket.off("initial_room_updates", onInitialRoomUpdatesCooldown);
      socket.off("update_cooldown", onUpdateCooldown);
    };
  }, [cooldown]);

  useEffect(() => {
    socket.on("room_guest_join", onRoomGuestJoin);
    return () => {
      socket.off("room_guest_join", onRoomGuestJoin);
    };
  }, [joinSuccessful]);

  useEffect(() => {
    document.body.style.backgroundColor = "rgb(32, 0, 0)";
    socket.emit("join_room_guest", {
      roomName,
    });
  }, []);

  function onRoomGuestJoin (data) {
    setJoinSuccessful(data.join)
    socket.emit("join_room", {roomName})
  }

  function onInitialRoomUpdatesOriginal(data) {
    setOriginalList(data.songs);
  }
  function onSendUpdatedFiltersOriginal(data) {
    if (!originalList[0]) setOriginalList(data.songs);
    else return;
  }
  function onInitialRoomUpdatesSonglist(data) {
    setSonglist(applyFilters(data.songs, data.filters[1], data.filters[0]));
  }
  function onSendUpdatedFiltersSonglist(data) {
    setSonglist(applyFilters(originalList, data.difficulties, data.level));
    setPageNumber(0);
  }
  function onInitialRoomUpdatesLevelFilters(data) {
    setLevelFilters(data.filters[0]);
  }
  function onSendUpdatedFiltersLevelFilters(data) {
    setLevelFilters(data.level);
  }
  function onInitialRoomUpdatesDifficulties(data) {
    setDifficulties(data.filters[1]);
  }
  function onInitialRoomUpdatesCooldown(data) {
    setCooldown(data.cooldown);
  }

  function onInitialRoomUpdatesRequests(data) {
    setRequestList(data.requestList);
  }

  function onSendUpdatedFiltersDifficulties(data) {
    setDifficulties(data.difficulties);
  }

  function onUpdateCooldown(data) {
    setCooldown(data.cooldown);
  }

  function onUpdateRequests(data) {
    setRequestList(data.requestList);
  }

  function handleSearchText(e: React.ChangeEvent<HTMLInputElement>) {
    setPageNumber(0);
    setSearchText(e.target.value);
  }

  function handleDisplayNumChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setPageNumber(0);
    setDisplayNumber(parseInt(e.target.value));
  }

  function handleStyleFilters(e: React.ChangeEvent<HTMLDivElement>) {
    const style = e.target.className;
    let newStyleFilters = [...styleFilters];
    if (style === "first")
      newStyleFilters[0]["1st&substream"] =
        !newStyleFilters[0]["1st&substream"];
    else if (style === "second")
      newStyleFilters[0]["2nd style"] = !newStyleFilters[0]["2nd style"];
    else if (style === "third")
      newStyleFilters[0]["3rd style"] = !newStyleFilters[0]["3rd style"];
    else if (style === "fourth")
      newStyleFilters[0]["4th style"] = !newStyleFilters[0]["4th style"];
    else if (style === "fifth")
      newStyleFilters[0]["5th style"] = !newStyleFilters[0]["5th style"];
    else if (style === "sixth")
      newStyleFilters[0]["6th style"] = !newStyleFilters[0]["6th style"];
    else if (style === "seventh")
      newStyleFilters[0]["7th style"] = !newStyleFilters[0]["7th style"];
    else if (style === "eighth")
      newStyleFilters[0]["8th style"] = !newStyleFilters[0]["8th style"];
    else if (style === "ninth")
      newStyleFilters[0]["9th style"] = !newStyleFilters[0]["9th style"];
    else if (style === "tenth")
      newStyleFilters[0]["10th style"] = !newStyleFilters[0]["10th style"];
    else {
      newStyleFilters[0][style] = !newStyleFilters[0][style];
    }
    if (
      newStyleFilters[0]["1st&substream"] &&
      newStyleFilters[0]["2nd style"] &&
      newStyleFilters[0]["3rd style"] &&
      newStyleFilters[0]["4th style"] &&
      newStyleFilters[0]["5th style"] &&
      newStyleFilters[0]["6th style"] &&
      newStyleFilters[0]["7th style"] &&
      newStyleFilters[0]["8th style"] &&
      newStyleFilters[0]["9th style"] &&
      newStyleFilters[0]["10th style"] &&
      newStyleFilters[0]["IIDX RED"] &&
      newStyleFilters[0]["HAPPY SKY"] &&
      newStyleFilters[0]["DistorteD"] &&
      newStyleFilters[0]["GOLD"] &&
      newStyleFilters[0]["DJ TROOPERS"] &&
      newStyleFilters[0]["EMPRESS"] &&
      newStyleFilters[0]["SIRIUS"] &&
      newStyleFilters[0]["Resort Anthem"] &&
      newStyleFilters[0]["Lincle"] &&
      newStyleFilters[0]["tricoro"] &&
      newStyleFilters[0]["SPADA"] &&
      newStyleFilters[0]["PENDUAL"] &&
      newStyleFilters[0]["copula"] &&
      newStyleFilters[0]["SINOBUZ"] &&
      newStyleFilters[0]["CANNON BALLERS"] &&
      newStyleFilters[0]["Rootage"] &&
      newStyleFilters[0]["HEROIC VERSE"] &&
      newStyleFilters[0]["BISTROVER"] &&
      newStyleFilters[0]["CastHour"] &&
      newStyleFilters[0]["RESIDENT"] &&
      newStyleFilters[0]["EPOLIS"]
    ) {
      setAllFiltersChecked(true);
      setNoFiltersChecked(false);
    } else if (
      !newStyleFilters[0]["1st&substream"] &&
      !newStyleFilters[0]["2nd style"] &&
      !newStyleFilters[0]["3rd style"] &&
      !newStyleFilters[0]["4th style"] &&
      !newStyleFilters[0]["5th style"] &&
      !newStyleFilters[0]["6th style"] &&
      !newStyleFilters[0]["7th style"] &&
      !newStyleFilters[0]["8th style"] &&
      !newStyleFilters[0]["9th style"] &&
      !newStyleFilters[0]["10th style"] &&
      !newStyleFilters[0]["IIDX RED"] &&
      !newStyleFilters[0]["HAPPY SKY"] &&
      !newStyleFilters[0]["DistorteD"] &&
      !newStyleFilters[0]["GOLD"] &&
      !newStyleFilters[0]["DJ TROOPERS"] &&
      !newStyleFilters[0]["EMPRESS"] &&
      !newStyleFilters[0]["SIRIUS"] &&
      !newStyleFilters[0]["Resort Anthem"] &&
      !newStyleFilters[0]["Lincle"] &&
      !newStyleFilters[0]["tricoro"] &&
      !newStyleFilters[0]["SPADA"] &&
      !newStyleFilters[0]["PENDUAL"] &&
      !newStyleFilters[0]["copula"] &&
      !newStyleFilters[0]["SINOBUZ"] &&
      !newStyleFilters[0]["CANNON BALLERS"] &&
      !newStyleFilters[0]["Rootage"] &&
      !newStyleFilters[0]["HEROIC VERSE"] &&
      !newStyleFilters[0]["BISTROVER"] &&
      !newStyleFilters[0]["CastHour"] &&
      !newStyleFilters[0]["RESIDENT"] &&
      !newStyleFilters[0]["EPOLIS"]
    ) {
      setNoFiltersChecked(true);
      setAllFiltersChecked(false);
    } else {
      setAllFiltersChecked(false);
      setNoFiltersChecked(false);
    }
    setStyleFilters(newStyleFilters);
    setPageNumber(0);
  }

  function handleCheckAll(e: React.ChangeEvent<HTMLDivElement>) {
    setPageNumber(0)
    let newStyleFilters = [...styleFilters];
    let buttonType = e.target.className.split(" ")[0];
    console.log(buttonType);
    if (buttonType === "check") {
      newStyleFilters[0]["1st&substream"] = true;
      newStyleFilters[0]["2nd style"] = true;
      newStyleFilters[0]["3rd style"] = true;
      newStyleFilters[0]["4th style"] = true;
      newStyleFilters[0]["5th style"] = true;
      newStyleFilters[0]["6th style"] = true;
      newStyleFilters[0]["7th style"] = true;
      newStyleFilters[0]["8th style"] = true;
      newStyleFilters[0]["9th style"] = true;
      newStyleFilters[0]["10th style"] = true;
      newStyleFilters[0]["IIDX RED"] = true;
      newStyleFilters[0]["HAPPY SKY"] = true;
      newStyleFilters[0]["DistorteD"] = true;
      newStyleFilters[0]["GOLD"] = true;
      newStyleFilters[0]["DJ TROOPERS"] = true;
      newStyleFilters[0]["EMPRESS"] = true;
      newStyleFilters[0]["SIRIUS"] = true;
      newStyleFilters[0]["Resort Anthem"] = true;
      newStyleFilters[0]["Lincle"] = true;
      newStyleFilters[0]["tricoro"] = true;
      newStyleFilters[0]["SPADA"] = true;
      newStyleFilters[0]["PENDUAL"] = true;
      newStyleFilters[0]["copula"] = true;
      newStyleFilters[0]["SINOBUZ"] = true;
      newStyleFilters[0]["CANNON BALLERS"] = true;
      newStyleFilters[0]["Rootage"] = true;
      newStyleFilters[0]["HEROIC VERSE"] = true;
      newStyleFilters[0]["BISTROVER"] = true;
      newStyleFilters[0]["CastHour"] = true;
      newStyleFilters[0]["RESIDENT"] = true;
      newStyleFilters[0]["EPOLIS"] = true;
      setAllFiltersChecked(true);
      setNoFiltersChecked(false);
    } else {
      newStyleFilters[0]["1st&substream"] = false;
      newStyleFilters[0]["2nd style"] = false;
      newStyleFilters[0]["3rd style"] = false;
      newStyleFilters[0]["4th style"] = false;
      newStyleFilters[0]["5th style"] = false;
      newStyleFilters[0]["6th style"] = false;
      newStyleFilters[0]["7th style"] = false;
      newStyleFilters[0]["8th style"] = false;
      newStyleFilters[0]["9th style"] = false;
      newStyleFilters[0]["10th style"] = false;
      newStyleFilters[0]["IIDX RED"] = false;
      newStyleFilters[0]["HAPPY SKY"] = false;
      newStyleFilters[0]["DistorteD"] = false;
      newStyleFilters[0]["GOLD"] = false;
      newStyleFilters[0]["DJ TROOPERS"] = false;
      newStyleFilters[0]["EMPRESS"] = false;
      newStyleFilters[0]["SIRIUS"] = false;
      newStyleFilters[0]["Resort Anthem"] = false;
      newStyleFilters[0]["Lincle"] = false;
      newStyleFilters[0]["tricoro"] = false;
      newStyleFilters[0]["SPADA"] = false;
      newStyleFilters[0]["PENDUAL"] = false;
      newStyleFilters[0]["copula"] = false;
      newStyleFilters[0]["SINOBUZ"] = false;
      newStyleFilters[0]["CANNON BALLERS"] = false;
      newStyleFilters[0]["Rootage"] = false;
      newStyleFilters[0]["HEROIC VERSE"] = false;
      newStyleFilters[0]["BISTROVER"] = false;
      newStyleFilters[0]["CastHour"] = false;
      newStyleFilters[0]["RESIDENT"] = false;
      newStyleFilters[0]["EPOLIS"] = false;
      setAllFiltersChecked(false);
      setNoFiltersChecked(true);
    }
    setStyleFilters(newStyleFilters);
  }

  function levelCheck(
    difficulty: string,
    song: Song,
    levelFilters: Array<LevelFilters>
  ): boolean {
    let songProperty: string = "";
    let match: boolean = false;
    if (difficulty === "beginner") songProperty = "beginnerDiff";
    if (difficulty === "normal") songProperty = "normalDiff";
    if (difficulty === "hyper") songProperty = "hyperDiff";
    if (difficulty === "another") songProperty = "anotherDiff";
    if (difficulty === "leggendaria") songProperty = "leggendariaDiff";

    if (levelFilters[0][1] === true) {
      if (song[songProperty] === "1") match = true;
    }
    if (levelFilters[0][2] === true) {
      if (song[songProperty] === "2") match = true;
    }
    if (levelFilters[0][3] === true) {
      if (song[songProperty] === "3") match = true;
    }
    if (levelFilters[0][4] === true) {
      if (song[songProperty] === "4") match = true;
    }
    if (levelFilters[0][5] === true) {
      if (song[songProperty] === "5") match = true;
    }
    if (levelFilters[0][6] === true) {
      if (song[songProperty] === "6") match = true;
    }
    if (levelFilters[0][7] === true) {
      if (song[songProperty] === "7") match = true;
    }
    if (levelFilters[0][8] === true) {
      if (song[songProperty] === "8") match = true;
    }
    if (levelFilters[0][9] === true) {
      if (song[songProperty] === "9") match = true;
    }
    if (levelFilters[0][10] === true) {
      if (song[songProperty] === "10") match = true;
    }
    if (levelFilters[0][11] === true) {
      if (song[songProperty] === "11") match = true;
    }
    if (levelFilters[0][12] === true) {
      if (song[songProperty] === "12") match = true;
    }

    return match;
  }
  function checkBeginner(
    songlist: Array<Song>,
    levelFilters: Array<LevelFilters>
  ): Array<Song> {
    let filteredSonglist: Array<Song> = [...songlist];
    return filteredSonglist.filter((song: Song) => {
      if (levelCheck("beginner", song, levelFilters)) return song;
    });
  }
  function checkNormal(
    songlist: Array<Song>,
    levelFilters: Array<LevelFilters>
  ): Array<Song> {
    let filteredSonglist: Array<Song> = [...songlist];
    return filteredSonglist.filter((song: Song) => {
      if (levelCheck("normal", song, levelFilters)) return song;
    });
  }
  function checkHyper(
    songlist: Array<Song>,
    levelFilters: Array<LevelFilters>
  ): Array<Song> {
    let filteredSonglist: Array<Song> = [...songlist];
    return filteredSonglist.filter((song: Song) => {
      if (levelCheck("hyper", song, levelFilters)) return song;
    });
  }
  function checkAnother(
    songlist: Array<Song>,
    levelFilters: Array<LevelFilters>
  ): Array<Song> {
    let filteredSonglist: Array<Song> = [...songlist];
    return filteredSonglist.filter((song: Song) => {
      if (levelCheck("another", song, levelFilters)) return song;
    });
  }
  function checkLeggendaria(
    songlist: Array<Song>,
    levelFilters: Array<LevelFilters>
  ): Array<Song> {
    let filteredSonglist: Array<Song> = [...songlist];
    return filteredSonglist.filter((song: Song) => {
      if (levelCheck("leggendaria", song, levelFilters)) return song;
    });
  }

  function applySearch(text: string, songlist: Array<Song>) {
    let result = songlist.filter((song) => {
      return (
        song.title.toLowerCase().includes(text) || song.title.includes(text)
      );
    });
    return result;
  }

  function handlePlus() {
    let max = applyStyleFilters(
      applySearch(searchText, songlist),
      styleFilters
    ).length;
    let difference =
      (pageNumber + 1) * displayNumber +
      displayNumber -
      applyStyleFilters(applySearch(searchText, songlist), styleFilters).length;
    if (difference > displayNumber) return;
    else setPageNumber(pageNumber + 1);
  }
  function handleMinus() {
    if (pageNumber === 0) return;
    else {
      setPageNumber(pageNumber - 1);
    }
  }

  function applyFilters(
    songlist: Array<Song>,
    difficulties: Array<Difficulties>,
    levelFilters: Array<LevelFilters>
  ): Array<Song> {
    let filteredSonglist: Array<Song> = [];
    if (difficulties[0]["beginner"] === true)
      filteredSonglist = [
        ...filteredSonglist,
        ...checkBeginner(songlist, levelFilters),
      ];
    if (difficulties[0]["normal"] === true)
      filteredSonglist = [
        ...filteredSonglist,
        ...checkNormal(songlist, levelFilters),
      ];
    if (difficulties[0]["hyper"] === true)
      filteredSonglist = [
        ...filteredSonglist,
        ...checkHyper(songlist, levelFilters),
      ];
    if (difficulties[0]["another"] === true)
      filteredSonglist = [
        ...filteredSonglist,
        ...checkAnother(songlist, levelFilters),
      ];
    if (difficulties[0]["leggendaria"] === true)
      filteredSonglist = [
        ...filteredSonglist,
        ...checkLeggendaria(songlist, levelFilters),
      ];
    return filteredSonglist;
  }

  function applyStyleFilters(
    songlist: Array<Song>,
    styleFilters: Array<StyleFilters>
  ): Array<Song> {
    let filteredSonglist: Array<Song> = [];
    if (songlist[0]) {
      filteredSonglist = songlist.filter((song) => {
        let version = song.version;
        if (styleFilters[0][version]) return song;
      });
    }
    return filteredSonglist;
  }
  function handleLanguageChange(e: React.ChangeEvent<HTMLDivElement>) {
    setLanguage(e.target.textContent.toLowerCase())
  }

  return (
    !joinSuccessful ? <div className="none">Room {roomName} does not exist.</div> :<div className="guest-view none">
      <div className="header-guest">
        <div className="guest-title">{textDatabase['guestTitle'][language]}</div>
        <div className="room-name">{roomName}</div>
      </div>
      <div className="filters guest">
        <div className="filters-title">{textDatabase['filtersTitle'][language]}</div>
        <div className="button-container">
          <div
            className={
              levelFilters[0][1]
                ? "diamond-guest level one active"
                : "diamond-guest level one"
            }
          >
            <div className="inner-text">1</div>
          </div>
          <div
            className={
              levelFilters[0][2]
                ? "diamond-guest level two active"
                : "diamond-guest level two"
            }
          >
            <div className="inner-text">2</div>
          </div>
          <div
            className={
              levelFilters[0][3]
                ? "diamond-guest level three active"
                : "diamond-guest level three"
            }
          >
            <div className="inner-text">3</div>
          </div>
          <div
            className={
              levelFilters[0][4]
                ? "diamond-guest level four active"
                : "diamond-guest level four"
            }
          >
            <div className="inner-text">4</div>
          </div>
          <div
            className={
              levelFilters[0][5]
                ? "diamond-guest level five active"
                : "diamond-guest level five"
            }
          >
            <div className="inner-text">5</div>
          </div>
          <div
            className={
              levelFilters[0][6]
                ? "diamond-guest level six active"
                : "diamond-guest level six"
            }
          >
            <div className="inner-text">6</div>
          </div>
        </div>
        <div className="button-container">
          <div
            className={
              levelFilters[0][7]
                ? "diamond-guest level seven active"
                : "diamond-guest level seven"
            }
          >
            <div className="inner-text">7</div>
          </div>
          <div
            className={
              levelFilters[0][8]
                ? "diamond-guest level eight active"
                : "diamond-guest level eight"
            }
          >
            <div className="inner-text">8</div>
          </div>
          <div
            className={
              levelFilters[0][9]
                ? "diamond-guest level nine active"
                : "diamond-guest level nine"
            }
          >
            <div className="inner-text">9</div>
          </div>
          <div
            className={
              levelFilters[0][10]
                ? "diamond-guest level ten active"
                : "diamond-guest level ten"
            }
          >
            <div className="inner-text">10</div>
          </div>
          <div
            className={
              levelFilters[0][11]
                ? "diamond-guest level eleven active"
                : "diamond-guest level eleven"
            }
          >
            <div className="inner-text">11</div>
          </div>
          <div
            className={
              levelFilters[0][12]
                ? "diamond-guest level twelve active"
                : "diamond-guest level twelve"
            }
          >
            <div className="inner-text">12</div>
          </div>
        </div>
        <div className="button-container diff">
          <div
            className={
              difficulties[0]["beginner"]
                ? "diamond-guest beginner-button active"
                : "diamond-guest beginner-button"
            }
          >
            <div className="inner-text">BEGINNER</div>
          </div>
          <div
            className={
              difficulties[0]["normal"]
                ? "diamond-guest normal-button active"
                : "diamond-guest normal-button"
            }
          >
            <div className="inner-text">NORMAL</div>
          </div>
          <div
            className={
              difficulties[0]["hyper"]
                ? "diamond-guest hyper-button active"
                : "diamond-guest hyper-button"
            }
          >
            <div className="inner-text">HYPER</div>
          </div>
        </div>
        <div className="button-container diff last">
          <div
            className={
              difficulties[0]["another"]
                ? "diamond-guest another-button active"
                : "diamond-guest another-button"
            }
          >
            <div className="inner-text">ANOTHER</div>
          </div>
          <div
            className={
              difficulties[0]["leggendaria"]
                ? "diamond-guest leggendaria-button active"
                : "diamond-guest leggendaria-button"
            }
          >
            <div className="inner-text">LEGGENDARIA</div>
          </div>
        </div>
      </div>
      <div>{textDatabase['currentCooldown'][language]} {cooldown} {textDatabase['secondsText'][language]}</div>
      {cooldownRemaining !== 0 && (
        <div>{cooldownRemaining} seconds remaining</div>
      )}
      <div className="style-filters">
        <div className="style-filters-container">
          <div
            className={
              styleFilters[0]["1st&substream"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="first" src={firstBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["2nd style"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="second" src={secondBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["3rd style"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="third" src={thirdBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["4th style"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="fourth" src={fourthBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["5th style"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="fifth" src={fifthBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["6th style"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="sixth" src={sixthBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["7th style"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="seventh" src={seventhBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["8th style"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="eighth" src={eighthBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["9th style"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="ninth" src={ninthBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["10th style"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="tenth" src={tenthBanner}></img>
          </div>
        </div>
        <div className="style-filters-container">
          <div
            className={
              styleFilters[0]["IIDX RED"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="IIDX RED" src={iidxRedBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["HAPPY SKY"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="HAPPY SKY" src={happySkyBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["DistorteD"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="DistorteD" src={distortedBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["GOLD"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="GOLD" src={goldBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["DJ TROOPERS"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="DJ TROOPERS" src={djTroopersBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["EMPRESS"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="EMPRESS" src={empressBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["SIRIUS"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="SIRIUS" src={siriusBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["Resort Anthem"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="Resort Anthem" src={resortAnthemBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["Lincle"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="Lincle" src={lincleBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["tricoro"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="tricoro" src={tricoroBanner}></img>
          </div>
        </div>
        <div className="style-filters-container">
          <div
            className={
              styleFilters[0]["SPADA"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="SPADA" src={spadaBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["PENDUAL"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="PENDUAL" src={pendualBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["copula"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="copula" src={copulaBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["SINOBUZ"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="SINOBUZ" src={sinobuzBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["CANNON BALLERS"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="CANNON BALLERS" src={cannonBallersBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["Rootage"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="Rootage" src={rootageBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["HEROIC VERSE"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="HEROIC VERSE" src={heroicVerseBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["BISTROVER"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="BISTROVER" src={bistroverBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["CastHour"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="CastHour" src={castHourBanner}></img>
          </div>
          <div
            className={
              styleFilters[0]["RESIDENT"]
                ? "filter-banner"
                : "filter-banner unselect"
            }
            onClick={handleStyleFilters}
          >
            <img className="RESIDENT" src={residentBanner}></img>
          </div>
        </div>
        <div
          className={
            styleFilters[0]["EPOLIS"]
              ? "filter-banner epolis-banner"
              : "filter-banner epolis-banner unselect"
          }
          onClick={handleStyleFilters}
        >
          <img className="EPOLIS" src={epolisBanner}></img>
        </div>
        <div className="check-uncheck-container">
          <div
            onClick={handleCheckAll}
            className={
              allFiltersChecked
                ? "check diamond-check-highlight"
                : "check diamond-check"
            }
          >
            <div onClick={handleCheckAll} className="check text">{textDatabase['checkAll'][language]}</div>
          </div>
          <div
            className={
              noFiltersChecked
                ? "uncheck diamond-check-highlight"
                : "uncheck diamond-check"
            }
            onClick={handleCheckAll}
          >
            <div onClick={handleCheckAll} className="uncheck text">{textDatabase['uncheckAll'][language]}</div>
          </div>
        </div>
      </div>
      <div className="search-area">
        <div>{textDatabase['searchTitle'][language]}</div>
        <input
          className="search-bar"
          type="text"
          placeholder="Song Title"
          value={searchText}
          onChange={(e) => handleSearchText(e)}
        ></input>
      </div>
      <div className="bottom-area">
        <div className="songs-area-title">
        {textDatabase['numberAvailable'][language]}
          <div className="no-of-songs">{songlist.length}</div>
        </div>
        <div className="songs-area">
          {songlist[0] &&
            applyStyleFilters(applySearch(searchText, songlist), styleFilters)
              .slice(
                pageNumber * displayNumber,
                pageNumber * displayNumber + displayNumber
              )
              .map((song: Song) => {
                return (
                  <Request
                    song={song}
                    filter={[levelFilters, difficulties]}
                    room={roomName}
                    cooldown={[
                      cooldown,
                      isOnCooldown,
                      setIsOnCooldown,
                      setCooldownRemaining,
                      cooldownRemaining
                    ]}
                    request={requestList}
                    language={language}
                  />
                );
              })}
        </div>
        <div className="footer-guest">
          <div className="page-arrows">
            <div className="plus-page" onClick={handlePlus}>
              <span className="material-symbols-outlined">
                arrow_forward_ios
              </span>
            </div>
            <div className="no-of-pages"> {textDatabase['pageText'][language]} {pageNumber + 1}</div>
            <div className="minus-page" onClick={handleMinus}>
              <span className="material-symbols-outlined">arrow_back_ios</span>
            </div>
          </div>
          <div>
            {pageNumber * displayNumber} -{" "}
            {pageNumber * displayNumber + displayNumber >
            applyStyleFilters(applySearch(searchText, songlist), styleFilters)
              .length
              ? applyStyleFilters(
                  applySearch(searchText, songlist),
                  styleFilters
                ).length
              : pageNumber * displayNumber + displayNumber}{" "}
            of{" "}
            {
              applyStyleFilters(applySearch(searchText, songlist), styleFilters)
                .length
            }
          </div>
        </div>
      </div>
      <div className="language-footer">
        <span className="material-symbols-outlined">language</span>
        <div className="languages">
          <div className="selectable-language" onClick={handleLanguageChange}>EN</div>
          <div className="selectable-language" onClick={handleLanguageChange}>JP</div>
        </div>
      </div>
    </div>
  );
}
