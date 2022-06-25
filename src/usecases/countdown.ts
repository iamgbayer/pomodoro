import dayjs from "dayjs";

export abstract class CountdownCallable {
  public abstract execute(timeLeft: string): void;
}

export class Countdown {
  private static _timeLeft = null;
  private static hasPaused = false;

  private static interval;

  public constructor(private readonly callable: CountdownCallable) {}

  public start({ milliseconds = 60000, startAt }) {
    Countdown.interval = setInterval(() => {
      const timeLeft = milliseconds - (Date.now() - startAt);
      Countdown._timeLeft = timeLeft;

      if (timeLeft < 0) {
        clearInterval(Countdown.interval);
      } else {
        this.callable.execute(dayjs(timeLeft).format("mm:ss"));
      }
    }, 100);
  }

  public static pause() {
    Countdown.hasPaused = true;
    clearInterval(this.interval);
  }
}
