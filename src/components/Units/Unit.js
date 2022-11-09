import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
} from 'react';

import {
  Waiting,
  Table,
  AutoComplete,
  Notification,
} from '@xbotvn/react-ui/components';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Button,
  TextField,
  Box,
  Checkbox,
  FormControlLabel,
} from '@xbotvn/react-ui/core';
import { colors } from '@xbotvn/react-ui/styles';
import { uniq } from '@xbotvn/utils/collection';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { handleUpdateUnit, handleCreateUnit } from '../../redux/actions/units';
import * as Icons from '../Icons';
import Address from './Address';
import Staff from './Staff';

function Unit({ onClose, unitId }) {
  const dispatch = useDispatch();
  const skipPageResetRef = useRef();
  const { unit, unitTypesOptions, handling } = useSelector(({ units, catalogs }) => ({
    unit: units?.data?.[unitId] ?? {},
    handling: units?.handling ?? false,
    unitTypesOptions: catalogs.system?.product?.data?.config?.unitTypes ?? {},
  }));

  const [type, setType] = useState(unit.type);
  const [address, setAddress] = useState({
    province: unit.province || '',
    district: unit.district || '',
    ward: unit.ward || '',
  });
  const [name, setName] = useState(unit.name || '');
  const [storage, setStorage] = useState(unit.storage || 1);
  const [elibot, setElibot] = useState(unit.elibot || false);
  const [admins, setAdmins] = useState(unit.admins || []);
  const [staffs, setStaffs] = useState(unit.staffs || []);
  const [newStaff, setNewStaff] = useState(false);

  const level = useMemo(() => unitTypesOptions?.[type]?.level ?? '', [type]);

  const columns = useMemo(() => [
    {
      Header: 'Email',
      accessor: 'email',
      disableEdit: true,
      width: 250,
    },
    {
      Header: 'Quản trị',
      accessor: 'admin',
      type: 'checkbox',
      width: 80,
    },
    {
      Header: ' ',
      accessor: 'id',
      // eslint-disable-next-line react/prop-types
      Cell: ({ cell: { value } }) => (
        <IconButton
          size="small"
          onClick={() => {
            setStaffs((prevStaffs) => prevStaffs.filter((s) => s !== value));
            setAdmins((prevAdmins) => prevAdmins.filter((s) => s !== value));
          }}
        >
          <Icons.XBin stroke={colors.red[400]} />
        </IconButton>
      ),
      action: true,
      width: 50,
    },
  ], []);

  const rows = useMemo(() => staffs.map((email) => ({
    id: email,
    email,
    admin: admins.includes(email),
  })), [staffs, admins]);

  useEffect(() => {
    skipPageResetRef.current = false;
  }, [rows]);

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle title={unit.name || 'Thêm Mới Đơn Vị'} onClose={onClose} />
      <DialogContent dividers>
        {handling ? <Waiting fullscreen /> : null}
        {newStaff ? (
          <Staff
            onClose={(email, admin) => {
              if (email) {
                setStaffs((prevStaffs) => {
                  if (prevStaffs.find(({ email: e }) => e === email)) {
                    Notification.warn('Tài khoản này đã được thêm.');
                    return prevStaffs;
                  }
                  return [email, ...prevStaffs];
                });
                if (admin) setAdmins((prevAdmins) => uniq([...prevAdmins, email]));
              }
              setNewStaff();
            }}
          />
        ) : null}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <AutoComplete
              value={type || null}
              options={Object.keys(unitTypesOptions)}
              getOptionLabel={(value) => unitTypesOptions?.[value].name}
              onChange={(e, value) => setType(value)}
              inputProps={{
                label: 'Loại Đơn Vị',
                placeholder: 'Chọn Loại Đơn Vị',
              }}
            />
          </Grid>
          {unitTypesOptions?.[type]?.elibot ? (
            <FormControlLabel
              label="ELIBOT"
              control={(
                <Checkbox
                  checked={elibot}
                  onChange={() => setElibot((prevElibot) => !prevElibot)}
                />
              )}
            />
          ) : null}
          {type ? (
            <Grid item xs={12}>
              <Address
                level={unitTypesOptions?.[type]?.level ?? ''}
                value={address}
                onChange={(val) => setAddress(val)}
              />
            </Grid>
          ) : null}
          <Grid item xs={7}>
            <TextField
              label="Tên Đơn Vị"
              required
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>
          <Grid item xs={5}>
            <TextField
              label="Dung Lượng Sử Dụng (GB)"
              required
              fullWidth
              value={storage}
              type="number"
              onChange={(e) => setStorage(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Box width={400} ml="auto" mr="auto">
              <Table
                columns={columns}
                data={rows}
                updateHandler={(rowId, column, newValue) => {
                  skipPageResetRef.current = true;
                  if (column === 'admin') {
                    setAdmins((prevAdmins) => {
                      const filtered = prevAdmins.filter((s) => s !== rowId);
                      if (newValue) {
                        return [...filtered, rowId];
                      }
                      return filtered;
                    });
                  }
                }}
                height={300}
                disableGlobalFilter
                disableFilters
                disableGroupBy
                autoResetPage={!skipPageResetRef.current}
                autoResetExpanded={!skipPageResetRef.current}
                autoResetGroupBy={!skipPageResetRef.current}
                autoResetSelectedRows={!skipPageResetRef.current}
                autoResetSortBy={!skipPageResetRef.current}
                autoResetFilters={!skipPageResetRef.current}
                autoResetRowState={!skipPageResetRef.current}
                rowHeight={56}
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          color="secondary"
          startIcon={<Icons.XPlus stroke={colors.primary[400]} />}
          onClick={() => setNewStaff(true)}
        >
          Thêm Nhân Sự
        </Button>
        <Button
          color="primary"
          startIcon={<Icons.XSave stroke="white" />}
          onClick={() => {
            if (!level) {
              Notification.warn('Loại đơn vị không được bỏ trống.');
              return;
            }
            if (!name) {
              Notification.warn('Tên đơn vị không dược bỏ trống.');
              return;
            }
            switch (level) {
              case 'province':
                if (!address.province) {
                  Notification.warn('Tỉnh/Thành không dược bỏ trống.');
                  return;
                }
                break;
              case 'district':
                if (!address.district) {
                  Notification.warn('Quận/Huyện không dược bỏ trống.');
                  return;
                }
                break;
              case 'ward':
                if (!address.ward) {
                  Notification.warn('Phường/Xã không dược bỏ trống.');
                  return;
                }
                break;
              default:
            }

            const updateContent = {
              type,
              name,
              ...address,
              staffs,
              admins,
              storage,
            };

            if (unitTypesOptions?.[type]?.elibot) {
              updateContent.elibot = elibot;
            }

            dispatch(unitId ? handleUpdateUnit(
              unitId,
              updateContent,
              (err) => {
                if (!err) onClose();
              },
            ) : handleCreateUnit(updateContent, (err) => { if (!err) onClose(); }));
          }}
        >
          Cập Nhật
        </Button>
        {!unitId ? (
          <Button
            color="primary"
            onClick={() => {
              if (!level) {
                Notification.warn('Loại đơn vị không được bỏ trống.');
                return;
              }
              if (!name) {
                Notification.warn('Tên đơn vị không dược bỏ trống.');
                return;
              }
              switch (level) {
                case 'province':
                  if (!address.province) {
                    Notification.warn('Tỉnh/Thành không dược bỏ trống.');
                    return;
                  }
                  break;
                case 'district':
                  if (!address.district) {
                    Notification.warn('Quận/Huyện không dược bỏ trống.');
                    return;
                  }
                  break;
                case 'ward':
                  if (!address.ward) {
                    Notification.warn('Phường/Xã không dược bỏ trống.');
                    return;
                  }
                  break;
                default:
              }

              const updateContent = {
                type,
                name,
                ...address,
                staffs,
                admins,
              };
              dispatch(handleCreateUnit(updateContent, (err) => {
                if (!err) {
                  setName('');
                  setStaffs([]);
                  setAdmins([]);
                }
              }));
            }}
          >
            Lưu &#38; Tiếp Tục
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}

Unit.propTypes = {
  onClose: PropTypes.func.isRequired,
  unitId: PropTypes.string,
};

Unit.defaultProps = {
  unitId: '',
};

export default Unit;
