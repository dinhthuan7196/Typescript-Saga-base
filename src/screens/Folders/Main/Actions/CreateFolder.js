import React, { useState, useMemo, useEffect } from 'react';

import { Notification } from '@xbotvn/react-ui/components';
import {
  MenuItem,
  TextField,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  TreeView,
  Typography,
  TreeItem,
  Box,
  Grid,
} from '@xbotvn/react-ui/core';
import { colors } from '@xbotvn/react-ui/styles/index';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { Icons } from '../../../../components';
import { handleCreateFolder, handleCreateFolderFromTemplate } from '../../../../redux/actions/folders';

const foldersToNodes = (prefix, folders, expanded, storeTypesOptions) => folders.map(
  ({ name, storeType, folders: child }, idx) => {
    const nid = `${prefix}_${idx}`;
    const childNodes = foldersToNodes(nid, child || [], expanded, storeTypesOptions);
    return (
      <TreeItem
        key={nid}
        nodeId={nid}
        label={(
          <Box
            display="flex"
            height={40}
            boxShadow="inset 0px -1px 0px #F4F4F5"
            alignItems="center"
          >
            <Box flexGrow={1}><Typography>{name}</Typography></Box>
            <Box width={100}>
              <Typography>{storeTypesOptions?.[storeType] ?? ''}</Typography>
            </Box>
          </Box>
        )}
      >
        {childNodes.length ? childNodes : null}
      </TreeItem>
    );
  },
);

function CreateFolder({
  onClose,
  folderId,
}) {
  const dispatch = useDispatch();
  const {
    templates,
    reports,
    shares,
    expire,
    extend,
    allFolders,
    storeTypesOptions,
    unitId,
  } = useSelector(({ user, catalogs, folders }) => ({
    templates: (catalogs?.system?.product?.data?.config?.templates?.folders ?? []).filter(
      ({ categories }) => categories.includes(user?.unit?.type ?? ''),
    ),
    reports: folders?.data?.[folderId]?.reports ?? [],
    shares: folders?.data?.[folderId]?.shares ?? [],
    expire: folders?.data?.[folderId]?.expire ?? '',
    extend: folders?.data?.[folderId]?.extend ?? {},
    allFolders: folders?.data ?? {},
    storeTypesOptions: catalogs.system?.product?.data?.config?.storeTypes ?? {},
    unitId: user?.unit?.id ?? '',
  }));

  const [storeType, setStoreType] = useState('year');
  const [name, setName] = useState('');
  const [useTemplate, setUseTemplate] = useState();
  const [folders, setFolders] = useState([]);

  const options = useMemo(() => Object.values(templates).map(({ name: text }, idx) => ({
    value: `${idx}`,
    text,
  })), [templates]);

  const normalRendered = useMemo(() => (
    <Grid container spacing={3}>
      <Grid item xs={6}>
        <TextField
          label="Lưu trữ"
          fullWidth
          required
          value={storeType}
          onChange={(e) => setStoreType(e.target.value)}
          select
          SelectProps={{}}
          variant="outlined"
        >
          {Object.entries(storeTypesOptions).map(([value, text]) => (
            <MenuItem key={value} value={value}>{text}</MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Tên thư mục"
          required
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên thư mục"
        />
      </Grid>
    </Grid>
  ), [storeType, name]);

  useEffect(() => {
    setFolders(templates?.[useTemplate]?.folders ?? []);
  }, [useTemplate]);

  return (
    <Dialog
      open
      maxWidth="sm"
      fullWidth
      onClose={onClose}
      scroll="body"
    >
      <DialogTitle
        onClose={onClose}
        title="Tạo Thư Mục"
        icon={<Icons.XCreateFolder />}
      />
      <DialogContent>
        <Box mt={2}>
          {(useTemplate !== undefined) ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Mẫu"
                  required
                  value={useTemplate}
                  fullWidth
                  onChange={(e) => setUseTemplate(e.target.value)}
                  select
                  SelectProps={{}}
                  variant="outlined"
                >
                  {options.map(({ text, value }) => (
                    <MenuItem key={value} value={value}>{text}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Box
                  display="flex"
                  width={1} height={40}
                  boxShadow="inset 0px -1px 0px #F4F4F5"
                  alignItems="center"
                >
                  <Box flexGrow={1}>
                    <Typography variant="subtitle2" style={{ fontWeight: 'bold' }}>Tên Thư Mục</Typography>
                  </Box>
                  <Box width={100}>
                    <Typography variant="subtitle2" style={{ fontWeight: 'bold' }}>Lưu Trữ</Typography>
                  </Box>
                </Box>
                <Box maxHeight={340}>
                  <Box maxHeight={330} overflow="auto">
                    <TreeView
                      defaultCollapseIcon={<Icons.XArrowDown />}
                      defaultExpandIcon={<Icons.XArrowTop />}
                    >
                      {foldersToNodes('root', folders, false, storeTypesOptions)}
                    </TreeView>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          ) : normalRendered}
        </Box>
      </DialogContent>
      <DialogActions>
        {(options.length && !useTemplate) ? (
          <Button
            color="secondary"
            onClick={() => setUseTemplate({ selectedIndex: '' })}
            startIcon={<Icons.XCopy fill={colors.primary[50]} stroke={colors.primary[400]} />}
          >
            Sử dụng mẫu
          </Button>
        ) : null}
        <Button
          color="primary"
          content="Tạo Thư Mục"
          onClick={() => {
            const isDuplicated = useTemplate ? folders.some(
              ({ name: folderName }) => Object.entries(allFolders).map((f) => f[1]).some(
                ({ name: fName, parent, unit }) => fName.toLowerCase() === folderName.toLowerCase()
                  && parent === folderId && unit === unitId,
              ),
            ) : Object.entries(allFolders).map((f) => f[1]).some(
              ({ name: fName, parent, unit }) => fName.toLowerCase() === name.toLowerCase()
                && parent === folderId && unit === unitId,
            );
            if (isDuplicated) {
              Notification.warn('Tên thư mục đã tồn tại!');
              return;
            }
            if (useTemplate) {
              if (!folders.length) {
                Notification.warn('Thư mục mẫu không được bỏ trống.');
                return;
              }
              dispatch(handleCreateFolderFromTemplate(folderId, folders, onClose));
            } else {
              if (!name.trim()) {
                Notification.error('Tên thư mục không được bỏ trống.');
                return;
              }
              const data = {
                name,
                storeType,
              };
              if (reports.length) data.reports = reports;
              if (shares.length) data.shares = shares;
              if (expire) data.expire = expire;
              if (Object.keys(extend).length) data.extend = extend;
              dispatch(handleCreateFolder(folderId, data, onClose));
            }
          }}
          startIcon={(
            <Icons.XCreateFolder
              stroke="white"
              fill={colors.primary[400]}
            />
          )}
        >
          Tạo thư mục
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CreateFolder.propTypes = {
  onClose: PropTypes.func.isRequired,
  folderId: PropTypes.string.isRequired,
};

export default CreateFolder;
