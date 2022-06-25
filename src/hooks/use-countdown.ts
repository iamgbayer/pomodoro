import useCountDown from "react-countdown-hook";
import dayjs from "dayjs";
import { useRef, useState } from "react";

// const initialTime = 1500000;
const initialTime = 60000;
const interval = 1000;

export const useCountdown = () => {
  const [isActive, setIsActive] = useState(false);
  const alreadyStarted = useRef(false);
  const [_timeLeft, { start, pause }] = useCountDown(initialTime, interval);

  const timeLeft = dayjs(_timeLeft).format("mm:ss");

  const isEnded = timeLeft === "00:00" && alreadyStarted.current === true;

  const _start = () => {
    setIsActive(true);
    alreadyStarted.current = true;
    _timeLeft > 0 ? start(_timeLeft) : start();
  };

  const _pause = () => {
    setIsActive(false);
    pause();
  };

  return {
    start: _start,
    pause: _pause,
    alreadyStarted: alreadyStarted.current,
    isActive,
    isEnded,
    timeLeft,
  };
};
