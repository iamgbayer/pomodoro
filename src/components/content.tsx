import { styled } from "@mui/material";

export const Content = styled("main")`
  background: #1d1d29;
  display: flex;
  width: 100%;
  align-items: center;
  flex-direction: column;
  height: 100vh;

  * {
    padding: 0;
    margin: 0;
  }

  .quill {
    display: flex;
    flex-direction: column-reverse;
  }

  .ql-snow .ql-picker,
  .ql-snow .ql-stroke {
    color: #fff;
    stroke: #fff;
  }

  .ql-editor,
  .ql-toolbar {
    color: #fff;
    padding-left: 0;
    padding-right: 0;
  }

  .ql-editor {
    min-height: 100px;
  }

  .ql-container.ql-snow,
  .ql-toolbar.ql-snow {
    border: none;
  }

  *:focus {
    outline: none;
  }

  body {
    background: #1d1d29;
  }
`;
