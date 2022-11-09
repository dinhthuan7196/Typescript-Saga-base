import React, {
  Fragment, useEffect, useMemo, useState,
} from 'react';

import { Confirmation, Waiting, Notification } from '@xbotvn/react-ui/components';
import {
  Box,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Icon,
} from '@xbotvn/react-ui/core';
import { colors } from '@xbotvn/react-ui/styles';
import {
  orderBy,
} from '@xbotvn/utils/collection';
import { compareAsc } from '@xbotvn/utils/date';
import { saveAs } from 'file-saver';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { useSelector, useDispatch } from 'react-redux';
import ReactTooltip from 'react-tooltip';

import { Icons } from '../../../../components';
import { callFileAPI, graphQLCaller } from '../../../../libs/backend';
import { handleUploadFiles, handleMoveFiles } from '../../../../redux/actions/files';
import { handleUpdateFolder } from '../../../../redux/actions/folders';
import { FullScreenUploadingButton } from '../../styles';
import { hasPermission } from '../../utils';
import Comment from './Comment';
import CreateFolder from './CreateFolder';
import Delete from './Delete';
import DigitalSignature from './DigitalSignature';
import FileInfo from './FileInfo';
import FolderInfo from './FolderInfo';
import FolderSelect from './FolderSelect';
import History from './History';
import Permissions from './Permissions';
import Reports from './Reports';
import Shares from './Shares';

function Actions({
  folderId,
  unitId,
  selected,
  filterLabel,
}) {
  const dispatch = useDispatch();
  const {
    folder,
    files,
    user,
    activeUnit,
    allFiles,
    allFolders,
    connectors,
    year,
  } = useSelector(({
    folders,
    files: filesStore,
    user: usersStore,
    catalogs,
  }) => ({
    folder: folders?.data?.[folderId] ?? {},
    files: filesStore?.data?.[folderId] ?? {},
    user: usersStore,
    activeUnit: usersStore.activeUnit,
    allFiles: filesStore?.data ?? [],
    allFolders: folders?.data ?? {},
    connectors: catalogs?.system?.product?.data?.config?.connectors ?? [],
    year: folders.year,
  }));

  const [showAction, setShowAction] = useState('');
  const [replaceFiles, setReplaceFiles] = useState();
  const [downloading, setDownloading] = useState(false);
  const [zIndex, setZIndex] = useState(-98);

  useEffect(() => {
    document.body.addEventListener('dragenter', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setZIndex(98);
    });
    document.body.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setZIndex(-98);
    });
  }, []);

  const totalSize = user?.unit?.storage ?? 1;
  const filesSize = Object.values(allFiles?.unit ?? []).map((item) => item?.size ?? 0);
  const folderSizes = Object.values(allFolders).map((item) => item?.size ?? 0);
  const allSize = [...filesSize, ...folderSizes].reduce((total, val) => total + val, 0);
  const available = totalSize - (allSize / 1024 / 1024 / 1024);

  const overdue = useMemo(() => selected.every((item) => {
    const expiration = folder.extend?.[item?.unit ?? ''] ?? folder.expire;
    if (!expiration) return false;
    return compareAsc(expiration, new Date()) !== 1;
  }), [folder, selected]);

  const allowFileActions = useMemo(() => {
    if (connectors.includes(unitId)) {
      switch (folder.unit) {
        case 'abot':
          return !!(Object.keys(folder).length > 0 && folder.key);
        default:
          return false;
      }
    }
    return true;
  }, [folder, connectors]);

  const updateSizeFolders = async () => {
    setDownloading(true);
    const filtered = selected.filter(({ type }) => type === 'folder').map(({ id }) => id);
    try {
      const results = await Promise.all(filtered.map(async (id) => {
        const { files: uFiles } = await graphQLCaller(
          'files',
          `{
            files(unitID: "${unitId}", folder: "${id}", year: ${year}) {
              size
            }
          }`,
        );
        return {
          id,
          information: {
            size: uFiles.reduce((total, { size }) => total + size, 0),
          },
        };
      }));
      if (results.length) {
        await graphQLCaller(
          'folders',
          `
            mutation modifyFolders($unitID: String!, $folders: [FolderInput]) {
              modifyFolders(unitID: $unitID, folders: $folders)
            }
          `,
          {
            unitID: unitId,
            folders: results,
          },
        );
      }
      window.location.reload();
    } catch ({ message }) {
      setDownloading(false);
      Notification.error(message);
    }
  };

  const actions = useMemo(() => {
    const { expire, extend } = folder;
    const unitsFolder = folderId === 'unit' || folder.unit === user?.unit?.id;
    const fullPermision = hasPermission('full', folder?.permissions ?? [], user);
    const selectedFullPermission = selected.every((item) => hasPermission('full', item?.permissions ?? [], user));
    const allowActions = [];

    const isReport = (folder?.reports || []).includes(user?.unit?.id);
    const isShare = (folder?.shares || []).includes(user?.unit?.id);
    const isConnectorValidSign = connectors.includes(selected[0]?.unit) && (selected[0]?.actions ?? []).includes('sign');

    let isExpire = expire ? new Date() > new Date(expire) : false;
    if (extend?.[activeUnit]) {
      isExpire = new Date() > new Date(extend?.[activeUnit]);
    }

    if (fullPermision && allowFileActions) {
      if (!filterLabel) {
        if (unitsFolder && unitId === user.unit.id) {
          allowActions.push({
            icon: <Icons.XCreateFolder />,
            text: 'Tạo Thư Mục',
            action: 'createFolder',
          });
        }
        if (!isShare && !isExpire) {
          allowActions.push({
            custom: (
              <Fragment key="uploadBtns">
                { allowFileActions
                  ? (
                    <Dropzone
                      key="upload"
                      multiple={!connectors.includes(folder.unit)}
                      onDrop={(uploadFiles) => {
                        const uploaded = Object.entries(files).map(([fid, values]) => ({
                          fid,
                          ...values,
                        }));
                        const exists = {};
                        const uploadSize = uploadFiles.map(({ size }) => size)
                          .reduce((a, s) => a + s);
                        if ((uploadSize / 1024 / 1024 / 1024) <= available) {
                          uploadFiles.forEach(({ name }) => {
                            const sameFiles = uploaded.filter(({ name: fname }) => name === fname);
                            if (sameFiles.length && !connectors.includes(folder.unit)) {
                              const sortedVersions = orderBy(sameFiles, (f) => f?.created.time ?? 0, 'desc');
                              exists[sortedVersions[0].fid] = name;
                            }
                          });
                          if (Object.keys(exists).length) {
                            setReplaceFiles({
                              files: uploadFiles,
                              replace: false,
                              exists,
                            });
                          } else {
                            setReplaceFiles();
                            dispatch(handleUploadFiles(folderId, uploadFiles));
                          }
                        } else Notification.warn('File vượt quá dung lượng');
                      }}
                    >
                      {({ getRootProps, getInputProps }) => (
                        <div {...getRootProps()}>
                          <input {...getInputProps()} />
                          <Button
                            key="upload"
                            variant="text"
                            startIcon={<Icons.XUpload />}
                            style={{ marginRight: 7 }}
                          >
                            Tải Lên
                          </Button>
                        </div>
                      )}
                    </Dropzone>
                  ) : null}
                <Dropzone
                  key="uploadOndrop"
                  multiple={!connectors.includes(folder.unit)}
                  noClick
                  onDrop={(uploadFiles) => {
                    const uploaded = Object.entries(files).map(([fid, values]) => ({
                      fid,
                      ...values,
                    }));
                    const uploadSize = uploadFiles.map(({ size }) => size).reduce((a, s) => a + s);
                    const exists = {};
                    if ((uploadSize / 1024 / 1024 / 1024) <= available
                        && !connectors.includes(folderId)) {
                      uploadFiles.forEach(({ name }) => {
                        const sameFiles = uploaded.filter(({ name: fname }) => name === fname);
                        if (sameFiles.length && !connectors.includes(folder.unit)) {
                          const sortedVersions = orderBy(sameFiles, (f) => f?.created.time ?? 0, 'desc');
                          exists[sortedVersions[0].fid] = name;
                        }
                      });
                      if (Object.keys(exists).length && !connectors.includes(folder.unit)) {
                        setReplaceFiles({
                          files: uploadFiles,
                          replace: false,
                          exists,
                        });
                      } else {
                        setReplaceFiles();
                        dispatch(handleUploadFiles(folderId, uploadFiles));
                      }
                    } else Notification.warn('File vượt quá dung lượng');
                  }}
                >
                  {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps()}>
                      <input {...getInputProps()} />
                      <FullScreenUploadingButton
                        key="uploadOndrop"
                        variant="text"
                        disableRipple
                        style={{ marginRight: 7, zIndex }}
                        draggable
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setZIndex(-98);
                        }}

                      />
                    </div>
                  )}
                </Dropzone>
              </Fragment>
            ),
            action: 'upload',
          });
        }
      }
      if (selected.length === 1 && selected[0].type === 'folder' && selectedFullPermission) {
        allowActions.push({
          icon: <Icons.XUserSettings />,
          text: 'Phân Quyền',
          action: 'permissions',
        });
      }
    }

    if (selected.length === 1 && selected[0].type && selected[0].id) {
      if (fullPermision) {
        allowActions.push({
          icon: <Icons.XInformation />,
          text: 'Thông Tin',
          action: 'information',
        });
        if (unitsFolder) {
          if (selected[0].type === 'folder') {
            allowActions.push({
              icon: <Icons.XShare />,
              text: 'Chia Sẻ',
              action: 'shares',
            });
            allowActions.push({
              icon: <Icons.XManagerList />,
              text: 'Phân Công',
              action: 'reports',
            });
          }
          if (selected[0].type === 'file') {
            if (selected[0].unit !== user.unit.id) {
              allowActions.push({
                icon: <Icon color="action">comment</Icon>,
                text: 'Nhận Xét',
                action: 'comment',
              });
            }
          }
        }
      }
      if (selected[0].type === 'file') {
        allowActions.push({
          custom: (
            <Button
              key="download"
              variant="text"
              color="inherit"
              style={{ marginRight: 7 }}
              startIcon={<Icon>download</Icon>}
              onClick={async () => {
                setDownloading(true);
                const { id, unit, name } = selected[0];
                const useConnector = connectors.includes(unit);
                const suffix = useConnector ? 'connector/downloadFile' : 'file/download';
                const params = useConnector ? { keys: selected[0]?.keys || [], connector: unit } : {
                  id,
                  unitID: unit,
                };
                try {
                  const data = await callFileAPI(suffix, params, true);
                  setDownloading(false);
                  saveAs(new Blob([data]), name);
                } catch ({ message }) {
                  setDownloading(false);
                  Notification.error(message);
                }
              }}
            >
              Tải về
            </Button>
          ),
        });
        if (fullPermision && !isShare && !isReport && !connectors.includes(selected[0].unit)) {
          allowActions.push({
            icon: <Icons.XPen />,
            text: 'Ký Số',
            action: 'sign',
          });
        } else if (fullPermision && !isShare && !isReport && !isConnectorValidSign) {
          allowActions.push({
            icon: <Icons.XPen />,
            text: 'Ký Số',
            action: 'sign',
          });
        }
        if ((selected[0]?.history ?? []).length > 1) {
          allowActions.push({
            icon: <Icons.XLoadingBack />,
            text: 'Phiên Bản Cũ',
            action: 'history',
          });
        }
      }
    }
    if (
      selected.length
      && selectedFullPermission
      && selected.every(({ unit }) => unit === user?.unit?.id)
    ) {
      allowActions.push({
        icon: <Icons.XArrangeArrow stroke={colors.primary[400]} />,
        text: 'Di Chuyển',
        action: 'move',
      });
    }

    if (user?.account?.xbot?.support && selected.some(({ type }) => type === 'folder')) {
      allowActions.push({
        custom: (
          <Fragment key="updateSize">
            <Icon
              data-tip
              data-for="update-size"
              variant="text"
              color="primary"
              style={{ cursor: 'pointer' }}
              onClick={() => updateSizeFolders()}
            >
              snippet_folder
            </Icon>
            <ReactTooltip id="update-size" place="bottom">
              <Typography>Cập nhật dung lượng thư mục</Typography>
            </ReactTooltip>
          </Fragment>
        ),
        action: 'updateSize',
      });
    }

    if (
      selected.length
      && selected.every(({ id, type }) => id && type)
      && fullPermision
      && (unitsFolder || allowFileActions)
    ) {
      allowActions.push({
        icon: <Icons.XBin stroke={colors.red[400]} />,
        action: 'delete',
        color: 'secondary',
      });
    }
    return allowActions;
  }, [
    selected,
    folder,
    files,
    zIndex,
    user,
  ]);

  const actionRendered = useMemo(() => {
    const defaultProps = {
      onClose: () => setShowAction(''),
    };
    if (showAction === 'createFolder') {
      return <CreateFolder {...defaultProps} folderId={folderId} />;
    } if (selected.length) {
      switch (showAction) {
        case 'permissions':
          return <Permissions {...defaultProps} folderId={selected[0].id} />;
        case 'delete':
          return <Delete {...defaultProps} folderId={folderId} selected={selected} />;
        case 'information':
          if (selected[0].type === 'folder') {
            return (
              <FolderInfo
                {...defaultProps}
                folderId={selected[0].id}
                name={selected[0].name}
                unit={selected[0].unit}
              />
            );
          } if (selected[0].type === 'file') {
            return (
              <FileInfo
                {...defaultProps}
                fileId={selected[0].id}
                folderId={selected[0].folder}
                {...selected[0]}
              />
            );
          }
          return null;
        case 'history':
          return (
            <History
              {...defaultProps}
              folderId={folderId}
              name={selected[0].name}
              history={selected[0].history}
              overdue={overdue}
            />
          );
        case 'reports':
          return (
            <Reports
              {...defaultProps}
              folderId={selected[0].id}
            />
          );
        case 'shares':
          return (
            <Shares
              {...defaultProps}
              folderId={selected[0].id}
            />
          );
        case 'sign':
          return (
            <DigitalSignature
              {...defaultProps}
              file={selected[0]}
            />
          );
        case 'comment':
          return (
            <Comment
              {...defaultProps}
              fileId={selected[0].id}
              folderId={selected[0].folder}
              {...selected[0]}
            />
          );
        case 'move': {
          if (selected.filter(({ type }) => type === 'folder').some(({ reports: fReports }) => fReports.length)) {
            setShowAction('');
            Notification.warn('Không được di chuyển thư mục đã được phân công!');
            return null;
          }
          return (
            <FolderSelect
              onClose={() => setShowAction('')}
              folderIds={selected.map(({ id }) => id)}
              onSelect={(id) => {
                const moveFiles = selected.filter(({ type }) => type === 'file');
                const moveFolders = selected.filter(({ type }) => type === 'folder').map(({ id: fid }) => fid);
                if (moveFiles.length) {
                  dispatch(handleMoveFiles(
                    moveFiles,
                    id,
                    () => setShowAction(),
                  ));
                }
                if (moveFolders.length) {
                  if ((allFolders?.[id]?.reports ?? []).length) {
                    Notification.warn('Không được di chuyển vào thư mục đã được phân công!');
                    return;
                  }
                  dispatch(handleUpdateFolder(
                    moveFolders.length > 1 ? moveFolders : moveFolders[0],
                    {
                      parent: id,
                    },
                    false,
                    () => setShowAction(),
                  ));
                }
              }}
              title="Di chuyển"
            />
          );
        }
        default:
          return null;
      }
    }
    return null;
  }, [
    showAction,
    selected,
    folderId,
    overdue,
  ]);

  return (
    <Box
      display="flex"
      bgcolor="white"
      p={1}
    >
      {actionRendered}
      {downloading ? <Waiting fullscreen /> : null}
      {replaceFiles ? (
        <Confirmation
          onClose={() => setReplaceFiles()}
          severity="warning"
          title="File đã tồn tại"
          primaryAction={() => {
            dispatch(handleUploadFiles(
              folderId,
              replaceFiles.files,
              replaceFiles.replace,
            ));
            setReplaceFiles();
          }}
          description={(
            <>
              <Typography>{`Files ${Object.values(replaceFiles.exists).join(', ')} đã có. Tiếp tục cập nhật những file này?`}</Typography>
              <FormControlLabel
                label="Xóa luôn bản cũ"
                labelPlacement="end"
                control={(
                  <Checkbox
                    checked={replaceFiles.replace}
                    onChange={() => setReplaceFiles((prevReplaceFiles) => ({
                      ...prevReplaceFiles,
                      replace: !prevReplaceFiles.replace,
                    }))}
                  />
                )}
              />
            </>
          )}
        />
      ) : null}
      <Box
        flexGrow={1}
        display="flex"
        alignItems="center"
        minHeight={36}
      >
        {actions.map(({
          icon,
          text,
          action,
          color,
          custom,
        }) => {
          if (custom) return custom;
          if (text) {
            return (
              <Button
                key={action}
                variant="text"
                color={color || 'inherit'}
                startIcon={icon}
                style={{ marginRight: 7 }}
                onClick={() => setShowAction(action)}
              >
                {text}
              </Button>
            );
          }
          return (
            <Button
              key={action}
              variant="text"
              color={color || 'inherit'}
              style={{ marginRight: 7 }}
              onClick={() => setShowAction(action)}
            >
              {icon}
            </Button>
          );
        })}
      </Box>
    </Box>
  );
}

Actions.propTypes = {
  folderId: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
  selected: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    folder: PropTypes.string,
    type: PropTypes.oneOf(['file', 'folder']),
    unit: PropTypes.string,
    permissions: PropTypes.arrayOf(PropTypes.object),
    history: PropTypes.arrayOf(PropTypes.object),
    actions: PropTypes.array,
    keys: PropTypes.array,
  })),
  filterLabel: PropTypes.string,
};

Actions.defaultProps = {
  selected: [],
  filterLabel: '',
};

export default Actions;
