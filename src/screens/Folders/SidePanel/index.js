/* eslint-disable max-len */
import React, { useMemo, useState } from 'react';

import {
  TreeItem,
  Icon,
  SvgIcon,
  Box,
  Typography,
  Button,
  IconButton,
  FormControlLabel,
  LinearProgress,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@xbotvn/react-ui/core';
import { colors } from '@xbotvn/react-ui/styles';
import { set, uniqBy } from '@xbotvn/utils/collection';
import { formatBytes } from '@xbotvn/utils/string';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { Icons } from '../../../components';
import { handleQueryFiles } from '../../../redux/actions/files';
import * as Styles from '../styles';
import Folders from './Folders';
import InvalidFolders from './InvalidFolders';
import Label from './Label';

function invalidFolders(folders = []) {
  const abandon = folders.map(({ parent, id: fid }) => {
    if (parent !== 'unit' && !folders.find(({ id }) => id === parent)) {
      return ({
        id: fid,
        reason: 'Không có thư mục cha',
      });
    } if (parent !== 'unit' && fid === parent) {
      return ({
        id: fid,
        reason: 'Thư mục cha không hợp lệ.',
      });
    }
    return null;
  }).filter((folder) => folder);

  if (abandon.length) {
    const valid = folders.filter(({ id }) => !abandon.find(({ id: aid }) => aid === id));
    const retest = invalidFolders(valid);
    return uniqBy([...abandon, ...retest], 'id');
  }
  return [];
}

function SidePanel({ folderId, windowSize }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const {
    unit,
    units,
    folders,
    files,
    isAdmin,
    connectors,
    unitTypesOptions,
  } = useSelector(({
    user,
    folders: foldersStore,
    files: filesStore,
    catalogs,
  }) => ({
    unit: user?.unit ?? {},
    folders: foldersStore?.data ?? {},
    units: foldersStore?.units ?? {},
    files: filesStore?.data ?? {},
    isAdmin: user?.account?.xbot?.support || (user?.unit?.admins ?? []).includes(user.email),
    connectors: catalogs?.system?.product?.data?.config?.connectors ?? [],
    unitTypesOptions: catalogs.system?.product?.data?.config?.unitTypes ?? {},
  }));

  const [showUnitsCount, setShowUnitsCount] = useState(false);
  const [expanded, setExpanded] = useState(['unit']);
  const [label, setLabel] = useState();
  const [search, setSearch] = useState('');
  const [showContact, setShowContact] = useState();
  const [showInvalid, setShowInvalid] = useState();

  const invalid = useMemo(
    () => invalidFolders(Object.values(folders).filter(({ unit: uid }) => uid === unit.id)),
    [folders],
  );

  const nodes = useMemo(() => {
    const normalizedSearch = (search || '').toLowerCase();
    const filtered = normalizedSearch ? Object.values(folders).filter(
      ({ name }) => name.toLowerCase().indexOf(normalizedSearch) !== -1,
    ) : Object.values(folders);
    const tmp = {
      unit: [],
      reports: [],
      shares: [],
    };
    connectors.forEach((connector) => {
      tmp[connector] = [];
    });
    filtered.forEach((folder) => {
      if (folder.unit === unit.id) {
        tmp.unit.push(folder);
      } else if ((folder?.reports ?? []).includes(unit.id)) {
        if (!tmp.reports[folder.unit]) tmp.reports[folder.unit] = [];
        tmp.reports[folder.unit].push(folder);
      } else if ((folder?.shares ?? []).includes(unit.id)) {
        const unitType = units?.[folder.unit]?.type ?? '';
        if (!tmp.shares?.[unitType]?.[folder.unit]) set(tmp.shares, `${unitType}.${folder.unit}`, []);
        tmp.shares[unitType][folder.unit].push(folder);
      } else if (connectors.includes(folder.unit)) {
        tmp[folder.unit].push(folder);
      }
    });

    return tmp;
  }, [folders, search, connectors]);

  const storageRendered = useMemo(() => {
    const available = unit?.storage ?? 1;
    const fileSizes = Object.values(files?.unit ?? []).filter(({ size }) => size);
    const folderSizes = Object.values(folders).filter(({ size, unit: fUnit }) => size && fUnit === unit.id);
    const allSize = [...fileSizes, ...folderSizes].reduce((total, { size }) => total + size, 0);
    const usedPercent = +(`${Math.round(`${allSize / 1024 / 1024 / 1024 / (available * 100)}e+2`)}e-2`);
    const usedStorage = allSize ? formatBytes(allSize) : '0 KB';
    return (
      <Box display="flex" flexDirection="column" mt={2}>
        <Typography>{`${usedStorage} / ${available}GB Đã Dùng`}</Typography>
        <Styles.StyledProgress>
          <LinearProgress
            variant="determinate"
            value={usedPercent}
          />
        </Styles.StyledProgress>
        <Button
          style={{ width: 180 }}
          color="secondary"
          startIcon={(
            <SvgIcon viewBox="0 0 24 24" color="inherit">
              <path
                clipRule="evenodd"
                d="M3.9 3.75C3.26421 3.75 2.75 4.26421 2.75 4.9V14C2.75 14.305 2.87116 14.5975 3.08683 14.8132C3.30249 15.0288 3.595 15.15 3.9 15.15H12C12.4142 15.15 12.75 15.4858 12.75 15.9C12.75 16.3142 12.4142 16.65 12 16.65H3.9C3.19718 16.65 2.52314 16.3708 2.02617 15.8738C1.5292 15.3769 1.25 14.7028 1.25 14V4.9C1.25 3.43579 2.43579 2.25 3.9 2.25H19.1C20.5642 2.25 21.75 3.43579 21.75 4.9V10C21.75 10.4142 21.4142 10.75 21 10.75C20.5858 10.75 20.25 10.4142 20.25 10V4.9C20.25 4.26421 19.7358 3.75 19.1 3.75H3.9ZM12.6484 8.50159C12.3426 8.21852 11.9395 8.06348 11.5224 8.06899C11.0986 8.07458 10.6938 8.24542 10.3941 8.54509C10.0944 8.84477 9.92358 9.24961 9.91799 9.67338C9.91248 10.0905 10.0675 10.4936 10.3506 10.7994C10.6564 11.0825 11.0594 11.2375 11.4766 11.232C11.9004 11.2264 12.3052 11.0556 12.6049 10.7559C12.9046 10.4562 13.0754 10.0514 13.081 9.6276C13.0865 9.21043 12.9315 8.80738 12.6484 8.50159ZM13.69 7.42202C13.0995 6.86436 12.3149 6.55839 11.5026 6.56912C10.6879 6.57988 9.90956 6.9083 9.33343 7.48443C8.7573 8.06056 8.42888 8.83887 8.41812 9.65358C8.40736 10.4683 8.71512 11.255 9.27584 11.8461C9.28493 11.8557 9.29426 11.865 9.30384 11.8741C9.89499 12.4349 10.6817 12.7426 11.4964 12.7319C12.3111 12.7211 13.0894 12.3927 13.6655 11.8165C14.2417 11.2404 14.5701 10.4621 14.5809 9.6474C14.5916 8.83503 14.2856 8.0505 13.728 7.45994C13.7219 7.45342 13.7157 7.447 13.7093 7.44066C13.703 7.43431 13.6966 7.4281 13.69 7.42202ZM18.5 11.85C17.4629 11.85 16.4894 12.0169 15.7473 12.3138C15.3783 12.4614 15.0295 12.6558 14.7605 12.91C14.49 13.1656 14.2506 13.5333 14.25 13.999L14.25 14V19.6L14.25 19.6009C14.2506 20.0665 14.4898 20.4341 14.7602 20.6898C15.0291 20.9441 15.3779 21.1386 15.7469 21.2862C16.4889 21.5831 17.4625 21.75 18.5 21.75C19.5375 21.75 20.5111 21.5831 21.2531 21.2862C21.6221 21.1386 21.9709 20.9441 22.2398 20.6898C22.5102 20.4341 22.7494 20.0665 22.75 19.6009V19.6V16.8522C22.7507 16.835 22.751 16.8175 22.751 16.8C22.751 16.7868 22.7507 16.7738 22.75 16.7608V14.0046L22.75 14L22.75 13.9949C22.7482 13.5311 22.5098 13.1647 22.2401 12.9097C21.971 12.6553 21.6219 12.4608 21.2529 12.3133C20.5107 12.0166 19.5369 11.85 18.5 11.85ZM21.25 16.7582V15.6878C20.5086 15.9837 19.5366 16.15 18.501 16.15C17.4646 16.15 16.4918 15.9835 15.75 15.6872V16.7557C15.7577 16.7656 15.7707 16.7803 15.7914 16.7999C15.8767 16.8806 16.0403 16.9877 16.3047 17.0935C16.8293 17.3034 17.6055 17.45 18.501 17.45C19.3965 17.45 20.1727 17.3034 20.6973 17.0935C20.9617 16.9877 21.1254 16.8806 21.2106 16.7999C21.2296 16.7819 21.2421 16.768 21.25 16.7582ZM15.75 18.4872V19.5565C15.7579 19.5664 15.7707 19.5809 15.7907 19.5998C15.8761 19.6806 16.0398 19.7878 16.3041 19.8935C16.8286 20.1034 17.6045 20.25 18.5 20.25C19.3955 20.25 20.1714 20.1034 20.6959 19.8935C20.9602 19.7878 21.1239 19.6806 21.2093 19.5998C21.2293 19.5809 21.2421 19.5664 21.25 19.5565V18.488C20.5084 18.7838 19.5365 18.95 18.501 18.95C17.4646 18.95 16.4918 18.7835 15.75 18.4872ZM21.2095 13.9997L21.2098 13.9999L21.2097 14.0001C21.1245 14.0807 20.961 14.1878 20.6967 14.2936C20.1724 14.5034 19.3965 14.65 18.501 14.65C17.6055 14.65 16.8293 14.5034 16.3047 14.2935C16.0403 14.1878 15.8766 14.0806 15.7914 13.9999L15.7912 13.9998C15.8768 13.919 16.0405 13.812 16.3044 13.7064C16.8291 13.4966 17.6051 13.35 18.5 13.35C19.3951 13.35 20.1713 13.4964 20.6961 13.7061C20.9606 13.8119 21.1242 13.919 21.2095 13.9997ZM21.2594 19.5433C21.2604 19.5411 21.261 19.5401 21.2611 19.5401C21.2612 19.5401 21.2607 19.5411 21.2594 19.5433ZM15.7389 19.5401C15.739 19.5401 15.7396 19.5411 15.7406 19.5433C15.7393 19.5411 15.7388 19.5401 15.7389 19.5401ZM4.25 13C4.25 12.5858 4.58579 12.25 5 12.25H6C6.41421 12.25 6.75 12.5858 6.75 13C6.75 13.4142 6.41421 13.75 6 13.75H5C4.58579 13.75 4.25 13.4142 4.25 13ZM17 5.25C16.5858 5.25 16.25 5.58579 16.25 6C16.25 6.41421 16.5858 6.75 17 6.75H18C18.4142 6.75 18.75 6.41421 18.75 6C18.75 5.58579 18.4142 5.25 18 5.25H17Z"
              />
            </SvgIcon>
          )}
          onClick={() => setShowContact(true)}
        >
          Mua Dung Lượng
        </Button>
      </Box>
    );
  }, [files, folders]);

  const buyingContact = () => (
    <Dialog
      open={showContact}
      onClose={() => setShowContact()}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle title="Mua dung lượng" onClose={() => setShowContact()} />
      <DialogContent>
        <Box display="flex">
          <Box>
            <Icons.ContactSVG />
          </Box>
          <Box display="flex" alignItems="center">
            <Typography variant="body2" style={{ fontSize: '1rem' }}>
              Để tăng dung lượng lưu trữ,
              vui lòng liên hệ số điện thoại:
              <b> 0909.18.77.80 </b>
              để được tư vấn cụ thể, xin cảm ơn.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );

  return (
    <Box
      p={2}
      bgcolor={colors.primary[500]}
      width={350}
      borderRadius="0 40px 0 0"
      color="white"
    >
      {showContact ? buyingContact() : null}
      {showInvalid ? <InvalidFolders invalidFolders={invalid} onClose={() => setShowInvalid()} /> : null}
      {(label !== undefined) ? <Label label={label} onClose={() => setLabel()} /> : null}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" style={{ fontWeight: 'bold' }}>
          Thư Mục
        </Typography>
        {(invalid.length && isAdmin) ? (
          <IconButton size="small" onClick={() => setShowInvalid(true)}>
            <Icon color="error">warning</Icon>
          </IconButton>
        )
          : (
            <FormControlLabel
              label="Số Đơn Vị"
              control={(
                <Checkbox
                  checked={showUnitsCount}
                  onChange={() => setShowUnitsCount((prevUnitsCount) => !prevUnitsCount)}
                />
              )}
            />
          )}
      </Box>
      <Styles.SidePanelSearch
        placeholder="Tìm kiếm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        variant="standard"
      />
      <Box
        height={windowSize.height - 140}
        overflow="auto"
      >
        <Box mt={1} mb={1}>
          <Styles.StyledTreeView
            defaultExpandIcon={<Icons.XArrowTop stroke="white" fill={colors.primary[400]} />}
            defaultCollapseIcon={<Icons.XArrowDown stroke="white" fill={colors.primary[400]} />}
            selected={folderId}
            expanded={expanded}
            onNodeToggle={(e, nodeIds) => {
              setExpanded(nodeIds);
              e.preventDefault();
            }}
            onNodeSelect={(e, nodeId) => {
              const { unit: foldersUnit } = folders?.[nodeId] ?? {};
              if (foldersUnit) {
                history.push(`/folders/${foldersUnit}/${nodeId}`);
              } else if (nodeId === 'unit') {
                history.push(`/folders/${unit.id}/unit`);
              } else {
                const connector = connectors.find((c) => `${c}_root` === nodeId);
                if (connector) {
                  history.push(`/folders/${connector}/${nodeId}`);
                }
              }
            }}
          >
            <Folders
              nodeId="unit"
              label="Hồ sơ đơn vị"
              folders={nodes.unit}
              showUnitsCount={showUnitsCount}
            />
            <TreeItem
              nodeId="reports"
              label={<Typography>Được phân công</Typography>}
            >
              {Object.entries(nodes.reports).map(([id, grouped]) => (
                <Folders
                  key={`report_${id}`}
                  nodeId={`report_${id}`}
                  label={units?.[id]?.name ?? id}
                  folders={grouped}
                  showUnitsCount={showUnitsCount}
                  showReportUnit={false}
                />
              ))}
            </TreeItem>
            <TreeItem
              nodeId="shares"
              label={<Typography>Danh sách đơn vị</Typography>}
            >
              {Object.entries(nodes.shares).map(([unitType, groupedType]) => (
                <TreeItem
                  key={unitType}
                  nodeId={unitType}
                  label={<Typography>{unitTypesOptions?.[unitType]?.name ?? unitType}</Typography>}
                >
                  {Object.entries(groupedType).map(([id, grouped]) => (
                    <Folders
                      key={`share_${id}`}
                      nodeId={`share_${id}`}
                      label={units?.[id]?.name ?? id}
                      folders={grouped}
                    />
                  ))}
                </TreeItem>
              ))}
            </TreeItem>
            {isAdmin ? connectors.map((connector) => {
              if (unit[connector]) {
                return (
                  <Folders
                    nodeId={`${connector}_root`}
                    label={connector.toUpperCase()}
                    folders={nodes[connector] ?? []}
                  />
                );
              }
              return null;
            }) : null}
          </Styles.StyledTreeView>
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={2}
        >
          <Typography variant="h6" style={{ fontWeight: 'bold' }}>Nhãn</Typography>
          {isAdmin ? (
            <IconButton color="secondary" onClick={() => setLabel('')}>
              <Icon>add</Icon>
            </IconButton>
          ) : null}
        </Box>
        <List dense>
          {(unit?.labels ?? []).map((value, idx) => (
            <ListItem key={idx}>
              <ListItemIcon>
                <Icons.XBookmark stroke={colors.yellow[400]} fill={colors.yellow[400]} />
              </ListItemIcon>
              <ListItemText
                primary={(
                  <Chip
                    style={{
                      border: 'none',
                      color: 'white',
                    }}
                    label={value}
                    color="primary"
                    variant="outlined"
                    onClick={() => dispatch(handleQueryFiles(value, { label: true }))}
                  />
                )}
              />
              {isAdmin ? (
                <ListItemSecondaryAction>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      setLabel(value);
                      e.stopPropagation();
                    }}
                  >
                    <Icons.XEdit stroke="white" fill={colors.primary[400]} />
                  </IconButton>
                </ListItemSecondaryAction>
              ) : null}
            </ListItem>
          ))}
        </List>
        {storageRendered}
      </Box>
    </Box>
  );
}

SidePanel.propTypes = {
  folderId: PropTypes.string.isRequired,
  windowSize: PropTypes.shape({
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
  }).isRequired,
};

export default SidePanel;
