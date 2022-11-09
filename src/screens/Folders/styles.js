import {
  Icon,
  TextField,
  IconButton,
  Typography,
  TreeView,
  Button,
} from '@xbotvn/react-ui/core';
import { colors } from '@xbotvn/react-ui/styles';
import styled from 'styled-components';

export const FolderIcon = styled(Icon)`
  color: ${colors.yellow[700]};
  margin-right: 5px;
`;

export const FileIcon = styled(Icon)`
  color: ${colors.green[700]};
  margin-right: 5px;
`;

export const ReportsIcon = styled(Icon)`
  color: ${colors.brown[700]};
  margin-right: 5px;
`;

export const NameColumn = styled.div`
  flex-grow: 1;
  min-width: 200px;
`;

export const CreatedColumn = styled.div`
  width: 150px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export const ModifiedColumn = styled.div`
  width: 100px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export const DeadlineColumn = styled.div`
  width: 100px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export const SizeColumn = styled.div`
  width: 120px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export const LabelsColumn = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export const SidePanelSearch = styled(TextField)`
  .MuiInputBase-root {
    background: ${colors.primary[600]};
    color: white;
    border: none;
    margin-top: 10px;
    margin-bottom: 10px;
    padding-left: 16px;
    border-radius: 8px;
  }
  .MuiInput-underline:before {
    border-bottom: none;
  }
  .MuiInput-underline:after {
    border-bottom: none;
  }
  .MuiInput-underline:hover:not(.Mui-disabled):before {
    border-bottom: none;
  }
`;

export const StyledTreeView = styled(TreeView)`
  .MuiTreeItem-content {
    height: 40px;
  }
  .MuiTreeItem-content:hover {
    background: #0963BE;
    border-radius: 8px;
  }
  .MuiTreeItem-label:hover {
    background: transparent;
  }
  .Mui-selected > .MuiTreeItem-content{
    background: #0083FF;
    border-radius: 8px;
  }
  .MuiTreeItem-root:focus > .MuiTreeItem-content .MuiTreeItem-label {
    background: transparent !important;
  }
`;

export const StyledProgress = styled.div`
  margin-top: 5px;
  margin-bottom: 15px;
  .MuiLinearProgress-barColorPrimary {
    background-color: ${colors.green[400]}
  }
  .MuiLinearProgress-colorPrimary {
    background-color: ${colors.grey[100]}
  }
  .MuiLinearProgress-root {
    height: 8px;
  }
`;

export const TitleFolder = styled(Typography)`
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const FullScreenUploadingButton = styled(Button)`
  &.MuiButtonBase-root {
    margin-right: 7;
    position: absolute;
    top: 50%;
    right: -50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    background: transparent;
    cursor: auto;
  }
  &.MuiButtonBase-root:hover {
    background: unset;

  }
`;

export const BtnReportUnit = styled(IconButton)`
  cursor: pointer;
  padding: 0px !important;
  margin-right: 5px !important;
  background: #fff !important;
  border-radius: 5px !important;
`;
