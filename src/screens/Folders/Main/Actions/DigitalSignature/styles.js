import { Dialog } from '@xbotvn/react-ui/core';
import styled from 'styled-components';

export const CustomDialog = styled(Dialog)`
  .resizable {
    width: 120px;
    border-radius: 0.75rem;
    padding: 20px;
    margin: 1rem;
    background-color: #29e;
    color: white;
    font-size: 20px;
    font-family: sans-serif;
    overflow: hidden;

    touch-action: none;

    /* This makes things *much* easier */
    box-sizing: border-box;
  }
  .resize-drag {
    width: 120px;
    border-radius: 8px;
    padding: 20px;
    margin: 1rem;
    background-color: #29e;
    color: white;
    font-size: 20px;
    font-family: sans-serif;

    touch-action: none;

    /* This makes things *much* easier */
    box-sizing: border-box;
  }

  .dropzone {
    background-color: #ccc;
    border: dashed 4px transparent;
    border-radius: 4px;
    width: 100%;
    transition: background-color 0.3s;
  }

  .drop-active {
    border-color: #aaa;
  }

  .drop-target {
    border-color: #fff;
  }

  .drag-drop {
    display: inline-block;
    position: absolute;
    z-index: 999;
    min-width: 40px;
    padding: 0em 0.5em;
    padding-left: 0;
    color: #fff;
    border: none;
    height: 100px;
    width: 200px;
    -webkit-transform: translate(0px, 0px);
    transform: translate(0px, 0px);
    transition: background-color 0.3s;
    line-height: 10px;
    padding-right: 0 !important;
    border: dashed 1px grey;
  }

  .signature {
    border: 1px dashed grey;
  }

  .drag-drop.can-drop {
    color: #000;
    background-color: transparent;
    opacity: 0.6;
    /* IE 8 */
    -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=90)";

    /* IE 5-7 */
    filter: alpha(opacity=90);

    /* Netscape */
    -moz-opacity: 0.9;

    /* Safari 1.x */
    -khtml-opacity: 0.9;
  }

  .dropped-out {
    display: block;
    padding: 0.75rem 1.25rem;
    margin-bottom: -1px;
    background-color: #fff;
    width: 200px;
    color: black;
  }
  .drag-drop.dropped-out .descrizione {
    font-size: 12px !important;
  }
  .pagination {
    font-size: 16px;
    line-height: 24px;
    color: #000000;
  }

  .viewer {
    display: flex;
    justify-content: center;
  }

  .canvas-container {
    text-align: center;
    padding: 0 !important;
  }
`;
