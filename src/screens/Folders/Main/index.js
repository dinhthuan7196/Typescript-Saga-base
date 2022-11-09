/* eslint-disable react/prop-types */
import React, {
  useMemo,
  useState,
  useEffect,
} from 'react';

import { Waiting, Table, Notification } from '@xbotvn/react-ui/components';
import {
  Typography,
  Box,
  Divider,
  Chip,
  IconButton,
  Icon,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@xbotvn/react-ui/core';
import { colors } from '@xbotvn/react-ui/styles';
import { orderBy } from '@xbotvn/utils/collection';
import {
  isSameDay, formatDistanceToNow, format,
} from '@xbotvn/utils/date';
import { formatBytes } from '@xbotvn/utils/string';
import { saveAs } from 'file-saver';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';

import { Icons } from '../../../components';
import { callFileAPI } from '../../../libs/backend';
import { handleGetFiles, handleQueryFiles } from '../../../redux/actions/files';
import { handleCloseCreateFolders } from '../../../redux/actions/folders';
import Actions from './Actions';
import CreateFolder from './Actions/CreateFolder';
import Documents from './Documents';
import Empty from './Empty';
import Links from './Links';

function Main({
  folderId,
  unitId,
  windowSize,
}) {
  const history = useHistory();
  const dispatch = useDispatch();
  const {
    folders,
    files,
    search,
    unit,
    units,
    funits,
    handling,
    storeType,
    isCreateFolders,
    connectors,
    docTypesOptions,
    categoriesOptions,
  } = useSelector(({
    folders: foldersStore,
    files: filesStore,
    user,
    units: unitsStore,
    catalogs,
  }) => ({
    folders: foldersStore?.data ?? {},
    files: filesStore?.data ?? {},
    search: filesStore?.search ?? {},
    unit: user?.unit ?? {},
    units: unitsStore?.data ?? {},
    funits: foldersStore?.units ?? {},
    handling: (foldersStore?.handling ?? false) || (filesStore?.handling ?? false),
    storeType: (foldersStore?.data ?? {})?.[folderId]?.storeType,
    isCreateFolders: foldersStore.askCreate,
    connectors: catalogs?.system?.product?.data?.config?.connectors ?? [],
    docTypesOptions: catalogs.system?.product?.data?.config?.docTypes ?? {},
    categoriesOptions: catalogs.system?.product?.data?.config?.categories ?? {},
  }));

  useEffect(() => {
    if (storeType || folderId === 'unit') {
      dispatch(handleGetFiles(folderId));
    }
  }, [folderId, storeType]);

  const [selectedRows, setSelectedRows] = useState({});
  const [downloading, setDownloading] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [showIncomplete, setShowincomplete] = useState(false);

  const docTypesLookup = useMemo(() => {
    const tmp = {};
    Object.entries(docTypesOptions).forEach(([key, { name }]) => { tmp[key] = name; });
    return tmp;
  }, [docTypesOptions]);

  useEffect(() => {
    if (handling) {
      setSelectedRows({});
    }
  }, [handling]);

  const unitsFolders = useMemo(() => Object.values(folders).filter(
    ({ unit: funit }) => funit === unitId,
  ), [unitId, folders]);

  const reportsFolders = useMemo(() => {
    const {
      expire,
      extend,
      reports,
      unit: funit,
    } = folders?.[folderId] ?? {};
    if (unit.id === funit && unitId === unit.id) {
      return (reports || []).map((uid) => ({
        type: 'reports',
        id: uid,
        name: funits?.[uid]?.name ?? (units?.[uid]?.name ?? uid),
        expire,
        extend,
      }));
    }
    return [];
  }, [
    folders,
    folderId,
    funits,
    units,
    unitId,
  ]);

  const columns = useMemo(() => {
    let cols = [
      {
        Header: 'Tiêu đề',
        accessor: 'name',
        width: 250,
        sticky: 'left',
        Cell: ({ cell: { value }, row }) => {
          let icon = null;
          let tooltip = null;
          switch (row?.original?.type) {
            case 'reports':
              icon = <Icons.XManagerList />;
              break;
            case 'folder':
              const color = (row?.original?.storeType === 'permanent') ? '#FFD45A' : '#B6DCFE';
              icon = <Icons.XFolder stroke={color} fill={color} />;
              tooltip = row?.original?.code ? (
                <ReactTooltip
                  id={row?.original?.code}
                  place="right"
                  isCapture
                />
              ) : null;
              break;
            case 'file':
              icon = <Icons.XFile />;
              break;
            default:
          }
          let comment = null;
          if (row?.original?.comment) {
            comment = (
              <IconButton
                size="small"
                onClick={() => setShowComment(row.original.comment)}
              >
                <Icon color="error">comment</Icon>
              </IconButton>
            );
          }
          return (
            <Box display="flex" alignItems="center">
              {icon}
              <Typography
                data-for={row?.original?.code}
                data-tip={row?.original?.code}
                variant="body1"
                style={{
                  flexGrow: 1,
                  paddingLeft: 5,
                  display: '-webkit-box',
                  WebkitLineClamp: '2',
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {value}
              </Typography>

              {tooltip}
              {comment}
            </Box>
          );
        },
      },
    ];
    if (storeType === 'document' || search.query) {
      cols = [
        ...cols,
        {
          Header: 'Số/Ký hiệu',
          accessor: 'docNo',
          width: 120,
        },
        {
          Header: 'Tên văn bản',
          accessor: 'docType',
          width: 150,
          lookup: docTypesLookup,
        },
        {
          Header: 'Thể loại văn bản',
          accessor: 'category',
          width: 200,
          lookup: categoriesOptions,
        },
        {
          Header: 'Ngày ban hành',
          accessor: 'date',
          type: 'date',
          width: 150,
        },
        {
          Header: 'Người ký',
          accessor: 'authority',
          width: 200,
        },
        {
          Header: 'Trích lục',
          accessor: 'description',
          width: 400,
        },
      ];
    }
    cols = [
      ...cols,
      {
        Header: 'Tác giả',
        accessor: 'created',
        width: 230,
        Cell: ({ cell: { value } }) => (
          <Typography variant="body1">
            {value?.user ?? ''}
          </Typography>
        ),
      },
      {
        Header: 'Chỉnh sửa',
        accessor: 'modified',
        width: 180,
        Cell: ({ cell: { value } }) => (
          <Typography variant="body1">
            {value?.time ? formatDistanceToNow(value.time) : ''}
          </Typography>
        ),
      },
    ];
    if (storeType !== 'document' && !search.query) {
      cols.push({
        Header: 'Thời hạn',
        accessor: 'expire',
        width: 180,
        Cell: ({ cell: { value }, row }) => {
          const { id, extend } = row?.original ?? {};
          let deadline;
          if (extend && extend?.[id]) {
            deadline = extend[id];
          } else if (value) {
            deadline = value;
          }
          return (
            <Typography variant="body1">
              {deadline ? format(deadline) : ''}
            </Typography>
          );
        },
      });
    } else {
      cols.push({
        Header: 'Số trang',
        accessor: 'pageCount',
        width: 100,
      });
    }
    cols = [
      ...cols,
      {
        Header: 'Dung lượng',
        accessor: 'size',
        width: 150,
        Cell: ({ cell: { value } }) => (
          <Typography variant="body1">{value ? formatBytes(value) : ''}</Typography>
        ),
      },
      {
        Header: 'Nhãn',
        accessor: 'labels',
        Cell: ({ cell: { value } }) => (
          <Box display="flex">
            {(value || []).map((lbl, idx) => (
              <Chip
                color="secondary"
                label={lbl}
                key={idx}
              />
            ))}
          </Box>
        ),
      },
    ];
    return cols;
  }, [storeType, docTypesLookup, categoriesOptions, search]);

  const data = useMemo(() => {
    const visibleFolders = orderBy(
      unitsFolders.filter(({ name, parent, labels }) => {
        if (search.query) {
          if (search.options?.label) return (labels || []).includes(search.query);
          return search.query.includes(name.toLowerCase());
        }
        if (search.query && search.options?.label && labels) {
          return labels.includes(search.query);
        }
        if (parent === folderId) return true;
        if ((folderId === 'unit') && (!unitsFolders.find(({ parent: pid }) => pid === parent) || !unitsFolders.find(({ id }) => id === parent))) return true;
        return false;
      }).map(({ size, ...folder }) => ({ type: 'folder', size: (size + folder?.childrenSize ?? 0), ...folder })), 'code',
    );

    const visibleFiles = [];
    const filteredFiles = Object.values(
      search.query ? (search.data ?? {}) : (files?.[folderId] ?? {}),
    );

    filteredFiles.forEach((file) => {
      const {
        created,
        modified,
        size,
        id,
        name,
        unit: funit,
        folder,
        comment,
        description,
        labels: fileLabels,
        docNo,
        docType,
        category,
        authority,
        date,
        pageCount,
        keys,
        actions,
        permissions,
        code,
      } = file;
      if (unitId === funit || funit === unit.id) {
        const duplicate = visibleFiles.find(({ name: fname }) => fname.replace('_signed', '') === name.replace('_signed', ''));

        if (duplicate) {
          const prevTime = duplicate?.created?.time ?? '';
          const time = created?.time ?? '';
          if (!prevTime || (time && isSameDay(time, prevTime))) {
            duplicate.id = id;
            duplicate.name = name;
            duplicate.description = description;
            duplicate.size = size || 0;
            duplicate.created = created;
            duplicate.modified = modified;
            duplicate.comment = comment;
            duplicate.labels = fileLabels;
          }
          duplicate.history.push(file);
        } else {
          visibleFiles.push({
            id,
            unit: funit,
            name,
            description,
            type: 'file',
            size: size || 0,
            created,
            modified,
            history: [file],
            folder,
            comment,
            labels: fileLabels,
            keys,
            actions,
            docNo,
            docType,
            category,
            authority,
            date,
            pageCount,
            permissions,
            code,
          });
        }
      }
    });
    return [
      ...reportsFolders,
      ...visibleFolders,
      ...visibleFiles,
    ];
  }, [
    reportsFolders,
    unitsFolders,
    files,
    unit,
    handling,
  ]);

  const selected = useMemo(() => {
    const tmp = [];
    Object.entries(selectedRows).forEach(([id, checked]) => {
      if (checked) {
        const found = data.find((row) => row.id === id);
        if (found) {
          tmp.push(found);
        }
      }
    });
    return tmp;
  }, [selectedRows, data]);

  useEffect(() => {
    if (storeType === 'document') {
      if (Object.values(files[folderId] ?? {}).some(
        (values) => ['docNo', 'docType', 'category', 'date'].some((field) => !values[field]),
      )) setShowincomplete(true);
    }
  }, [folderId, files, storeType]);

  return (
    <Box
      height={windowSize.height}
      width={windowSize.width - 350}
      bgcolor={colors.grey[100]}
      overflow="hidden"
    >
      {isCreateFolders ? (
        <CreateFolder
          folderId={folderId}
          onClose={() => dispatch(handleCloseCreateFolders())}
        />
      ) : null}
      {(handling || downloading) ? <Waiting fullscreen /> : null}
      {showIncomplete ? (
        <Documents folderId={folderId} onClose={() => setShowincomplete(false)} />
      ) : null}
      {showComment ? (
        <Dialog
          maxWidth="sm"
          fullWidth
          open
          onClose={() => setShowComment()}
        >
          <DialogTitle
            title="Nhận Xét"
            onClose={() => setShowComment()}
          />
          <DialogContent>
            <Box display="flex" pb={2} alignItems="baseline">
              <Box flexGrow={1}>
                <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                  {showComment.user || ''}
                </Typography>
              </Box>
              <Typography variant="caption">
                {showComment.time ? formatDistanceToNow(showComment.time) : ''}
              </Typography>
            </Box>
            {showComment?.content ?? 'Không có nội dung.'}
          </DialogContent>
        </Dialog>
      ) : null}
      <Links
        folderId={folderId}
        unitId={unitId}
      />
      <Actions
        selected={selected}
        folderId={folderId}
        unitId={unitId}
      />
      <Divider />
      <Box pt={2} pl={2} pr={2}>
        {
          data.length ? (
            <Table
              initialState={{
                selectedRowIds: selectedRows,
              }}
              columns={columns}
              data={data}
              disableFilters
              disableGroupBy
              rowHeight={56}
              height={windowSize.height - 240}
              onSelect={setSelectedRows}
              onRowDoubleClick={async (row) => {
                switch (row.type) {
                  case 'file':
                    try {
                      const imageTypes = ['jpg', 'jpeg', 'png', 'gif'];
                      const viewOffice = ['docx', 'doc', 'xlsx', 'xls'];
                      const fileType = row?.name.split('.')[row?.name.split('.').length - 1];
                      const isOffice = viewOffice.includes(fileType);
                      const isImage = imageTypes.includes(fileType);
                      const typesMapping = {
                        pdf: 'application/pdf',
                        html: 'text/html',
                        mp4: 'video/mp4',
                        image: `image/${fileType}`,
                      };
                      const temp = isImage ? 'image' : fileType;
                      const type = isOffice ? 'application/pdf' : typesMapping[temp];
                      setDownloading(true);
                      const { id, unit: fUnit } = row;
                      const useConnector = connectors.includes(fUnit);
                      const suffix = useConnector ? 'connector/downloadFile' : 'file/download';
                      const params = useConnector ? {
                        keys: row.keys || [],
                        connector: fUnit,
                        viewOnly: isOffice,
                      } : {
                        id,
                        unitID: fUnit,
                        viewOnly: isOffice,
                      };
                      const content = await callFileAPI(suffix, params, true);
                      setDownloading(false);
                      if (isOffice || isImage || Object.keys(typesMapping).includes(fileType)) {
                        const downloadUrl = URL.createObjectURL(
                          new Blob([content], { type, name: row.name }),
                        );
                        window.open(downloadUrl);
                      } else saveAs(new Blob([content]), row.name);
                    } catch ({ message }) {
                      setDownloading(false);
                      Notification.error(message);
                    }
                    break;
                  case 'folder':
                    history.push(`/folders/${row.unit}/${row.id}`);
                    dispatch(handleQueryFiles(''));
                    break;
                  case 'reports':
                    history.push(`/folders/${row.id}/${folderId}`);
                    break;
                  default:
                }
              }}
              getRowId={(row) => row.id}
            />
          ) : <Empty />
        }
      </Box>
    </Box>
  );
}

Main.propTypes = {
  folderId: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
  windowSize: PropTypes.shape({
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
  }).isRequired,
};

export default Main;
