/* eslint-disable import/no-unresolved */
import React, {
  useCallback,
  useRef,
  useContext,
  useState,
  useEffect,
} from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import update from "immutability-helper";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useHotkeys } from "react-hotkeys-hook";
import { v4 } from "uuid";
import AddIcon from "@mui/icons-material/Add";
import { StateContext } from "./contexts/state";
import { Menu, MenuItem, Stack, styled, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import QuillMarkdown from "quilljs-markdown";
import "quilljs-markdown/dist/quilljs-markdown-common-style.css";
import { Content } from "./components/content";
import { useCountdown } from "./hooks/use-countdown";

Quill.register("modules/markdownOptions", QuillMarkdown);

const channels = ["now", "next", "later"];
const labelsMap = {
  now: "Now",
  next: "Next",
  later: "Later",
};

export const delay = () => new Promise((resolve) => setTimeout(resolve, 1000));

export default function App() {
  const { tasks, setTasks, setOpened } = useContext(StateContext);

  console.log({ tasks });

  useHotkeys("esc", () => setOpened(null), {
    enabled: true,
    enableOnContentEditable: true,
    enableOnTags: ["INPUT", "SELECT", "TEXTAREA"],
  });

  const changeTaskStatus = useCallback(
    (id, status) => {
      let task = tasks.find((task) => task._id === id);
      const taskIndex = tasks.indexOf(task);
      task = { ...task, status };
      const newTasks = update(tasks, {
        [taskIndex]: { $set: task },
      });
      setTasks(newTasks);
    },
    [tasks]
  );

  return (
    <Content>
      <Stack maxWidth={940} width="100%">
        <DndProvider backend={HTML5Backend}>
          <Stack>
            {channels.map((channel) => (
              <KanbanColumn
                key={channel}
                status={channel}
                changeTaskStatus={changeTaskStatus}
              />
            ))}
          </Stack>
        </DndProvider>
      </Stack>
    </Content>
  );
}

const KanbanColumn = ({ status, changeTaskStatus }) => {
  const { tasks, setTasks, setOpened } = useContext(StateContext);

  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: "card",
    canDrop: () => {
      return status !== "now" || (status === "now" && length === 0);
    },
    drop(item: { id: string }) {
      changeTaskStatus(item.id, status);
    },
  });
  drop(ref);

  const getTasks = () => tasks.filter((item) => item.status === status);
  const length = getTasks().length;

  const add = () => {
    const id = v4();
    setTasks(
      // @ts-ignore
      update(tasks, { $push: [{ title: "", _id: id, status, content: "" }] })
    );

    setOpened(id);
  };

  return (
    <div ref={ref}>
      <div>
        <Stack
          flexDirection="row"
          justifyContent="space-between"
          sx={{
            textAlign: "left",
            color: "#fff",
            fontSize: 20,
            fontWeight: 600,
            padding: 2,
          }}
        >
          {labelsMap[status]} {status !== "now" && <AddIcon onClick={add} />}
        </Stack>

        <div style={{ padding: 8 }}>
          {getTasks().map((item) => (
            <KanbanItem
              key={item._id}
              id={item._id}
              title={item.title}
              status={status}
              content={item.content}
            >
              <div
                style={{
                  padding: 8,
                  fontSize: 14,
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                {item.title}
              </div>
            </KanbanItem>
          ))}
        </div>
      </div>
    </div>
  );
};

const CheckIcon = styled("div")`
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-radius: 4px;

  &:hover {
    background-color: #fff;
    cursor: pointer;
  }
`;

const CircleIcon = styled(Stack)`
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-radius: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  * {
    color: #fff;
  }
`;

const KanbanItem = ({ id, children, title, status, content }) => {
  const { selected, setSelected, opened, setOpened, setTasks, tasks } =
    useContext(StateContext);
  const { pause, start, timeLeft, isEnded, isActive, alreadyStarted } =
    useCountdown();

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(1);
  const open = Boolean(anchorEl);

  const setOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const ref = useRef(null);
  const [{ isDragging }, drag] = useDrag({
    type: "card",
    item: { type: "card", id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(ref);

  const isSelected = selected === id;
  const isOpened = opened === id;

  const updateTask = (query) => {
    const index = tasks.findIndex((task) => task._id === id);

    setTasks(update(tasks, query(index)));
  };

  const handleTitle = (event) => {
    updateTask((index) => ({
      [index]: {
        $merge: {
          title: event.target.value,
        },
      },
    }));
  };

  const handleContent = (value) => {
    updateTask((index) => ({
      [index]: {
        $merge: {
          content: value,
        },
      },
    }));
  };

  const handleCheck = () => {
    updateTask((index) => ({
      [index]: {
        $merge: {
          status: "done",
        },
      },
    }));
  };

  const handleDelete = () => {
    updateTask((index) => ({
      $splice: [[index, 1]],
    }));
  };

  const pomodoros = [0, 1, 2, 3, 4];

  const handlePomodoros = (event, pomodoro) => {
    updateTask((index) => ({
      [index]: {
        $merge: {
          pomodoros: pomodoros[pomodoro],
        },
      },
    }));

    setSelectedIndex(pomodoro);
    setAnchorEl(null);
  };

  const handleStart = async () => {
    start();
  };

  const handlePause = async () => {
    pause();
  };

  useHotkeys<HTMLElement>("delete", handleDelete, {
    enabled: true,
  });

  useEffect(() => {
    window.electron.send("pomodoro", { title, timeLeft });
  }, [timeLeft]);

  useEffect(() => {
    const handleMenu = (event) => {
      const { x, y } = event;
      window.electron.send("menu-opened", { x, y });
    };

    ref.current?.addEventListener("contextmenu", handleMenu);

    return () => ref.current?.removeEventListener("contextmenu", handleMenu);
  }, []);

  const input = useHotkeys<HTMLInputElement>("enter", () => setOpened(null), {
    enableOnContentEditable: true,
    enabled: true,
    enableOnTags: ["INPUT"],
  });

  return (
    <>
      {isOpened && (
        <div
          style={{
            background: "#242733",
            border: "1px solid #353747",
            display: "flex",
            flexDirection: "column",
            borderRadius: 4,
          }}
        >
          <Stack padding={2}>
            <Stack mb={2}>
              <input
                value={title}
                autoFocus
                ref={input}
                onChange={handleTitle}
                style={{
                  fontSize: 15,
                  background: "transparent",
                  color: "#fff",
                  border: "none",
                }}
              />
            </Stack>

            <ReactQuill
              defaultValue={content}
              onChange={handleContent}
              modules={{ markdownOptions: {} }}
            />
          </Stack>

          <div style={{ borderBottom: "1px solid #353747" }}></div>

          <Stack padding={2} flexDirection="row" justifyContent="flex-end">
            <TimerOutlinedIcon onClick={setOpen} sx={{ color: "#fff" }} />

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                "aria-labelledby": "lock-button",
                role: "listbox",
              }}
            >
              {pomodoros.map((option, index) => (
                <MenuItem
                  key={option}
                  disabled={index === 0}
                  selected={index === selectedIndex}
                  onClick={(event) => handlePomodoros(event, index)}
                >
                  {index === 0 && <>Pomodoros</>}
                  {index !== 0 && <>{option}</>}
                </MenuItem>
              ))}
            </Menu>
          </Stack>
        </div>
      )}

      {!isOpened && (
        <Stack
          tabIndex={-1}
          onDoubleClick={() => setOpened(id)}
          onClick={() => setSelected(id)}
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          height={40}
          ref={ref}
          paddingX={1}
          sx={{
            width: "100%",
          }}
          style={{
            opacity,
            borderRadius: 4,
            cursor: "pointer",
            background:
              status === "now"
                ? "#847BD3"
                : isSelected
                ? "#3C7CED"
                : "transparent",
          }}
        >
          <Stack flexDirection="row" alignItems="center">
            <CheckIcon onClick={handleCheck} />

            {status === "now" && (
              <>
                {isActive && !isEnded ? (
                  <CircleIcon ml={1} onClick={() => handlePause()}>
                    <PauseOutlinedIcon sx={{ fontSize: 10 }} />
                  </CircleIcon>
                ) : (
                  <CircleIcon ml={1} onClick={() => handleStart()}>
                    <PlayArrowIcon sx={{ fontSize: 10 }} />
                  </CircleIcon>
                )}
              </>
            )}

            <Typography fontSize={15}>{children}</Typography>
          </Stack>

          {status === "now" && alreadyStarted && (
            <Stack
              sx={{
                fontSize: isEnded ? 10 : 12,
                color: "#fff",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                backgroundColor: "#4F48A5",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "18px",
                paddingX: "5px",
                borderRadius: "4px",
              }}
            >
              {isEnded ? "Pomodoro done" : timeLeft}
            </Stack>
          )}
        </Stack>
      )}
    </>
  );
};
