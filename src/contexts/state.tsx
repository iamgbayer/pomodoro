import React, { createContext, useState } from "react";

export type Task = {
  _id: string;
  title: string;
  status: string;
  pomodoros: number;
  content: string;
};

export const StateContext = createContext<{
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
  opened: string;
  setOpened: React.Dispatch<React.SetStateAction<string>>;
}>({
  tasks: [],
  setTasks: (tasks: Task[]) => {},
  selected: "",
  setSelected: () => {},
  opened: "",
  setOpened: () => {},
});

type Props = {
  children: React.ReactNode;
};

export const StateProvider = ({ children }: Props) => {
  const [selected, setSelected] = useState("");
  const [opened, setOpened] = useState("");
  const [tasks, _setTasks] = useState(
    JSON.parse(window.localStorage.getItem("tasks")) ?? []
  );

  const setTasks = (tasks: Task[]) => {
    window.localStorage.setItem("tasks", JSON.stringify(tasks));

    _setTasks(tasks);
  };

  return (
    <StateContext.Provider
      value={{
        tasks,
        setTasks,
        selected,
        setSelected,
        opened,
        setOpened,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};
