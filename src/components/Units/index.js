import React, { useState, useMemo, useEffect } from 'react';

import {
  AutoComplete,
  Waiting,
  Table,
  Confirmation,
} from '@xbotvn/react-ui/components';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Box,
  DialogActions,
  Button,
  IconButton,
  Typography,
} from '@xbotvn/react-ui/core';
import { colors } from '@xbotvn/react-ui/styles';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { handleFindUnits, handleUpdateUnit } from '../../redux/actions/units';
import * as Icons from '../Icons';
import Address from './Address';
import Unit from './Unit';

function Units({
  onClose,
  onSelectChanged,
  selected,
  management,
}) {
  const dispatch = useDispatch();
  const {
    unit,
    support,
    admin,
    units,
    unitTypesOptions,
    handling,
  } = useSelector(({ user, units: unitsStore, catalogs }) => ({
    unit: user?.unit ?? {},
    support: user?.account?.xbot?.support ?? false,
    admin: user?.account?.xbot?.admin ?? false,
    units: unitsStore?.data ?? {},
    unitTypesOptions: catalogs.system?.product?.data?.config?.unitTypes ?? {},
    handling: unitsStore?.handling ?? false,
  }));

  const [filterType, setFilterType] = useState(null);
  const [address, setAddress] = useState({
    province: unit?.province ?? '',
    district: unit?.district ?? '',
    ward: unit?.ward ?? '',
  });
  const [removeUnit, setRemoveUnit] = useState();
  const [showUnit, setShowUnit] = useState();
  const [selecting, setSelecting] = useState({});

  useEffect(() => {
    if (selected) {
      const tmp = {};
      selected.forEach((unitId) => {
        tmp[unitId] = true;
      });
      setSelecting(tmp);
    }
  }, [selected]);

  useEffect(() => {
    const {
      province,
      district,
      ward,
    } = address;
    if (filterType) {
      const cleanFilter = { type: filterType };
      const unitsLevel = unitTypesOptions?.[unit?.type ?? '']?.level ?? '';
      const filterLevel = unitTypesOptions?.[filterType]?.level ?? '';
      switch (filterLevel) {
        case 'province':
          if (!province) return;
          cleanFilter.province = province;
          break;
        case 'district':
          cleanFilter.province = province;
          if (unitsLevel !== 'province' && !district) return;
          if (district) cleanFilter.district = district;
          break;
        case 'ward':
          cleanFilter.province = province;
          if (!['province', 'district'].includes(unitsLevel) && !ward) return;
          if (district) cleanFilter.district = district;
          if (ward) cleanFilter.ward = ward;
          break;
        default:
      }
      if (cleanFilter.type && cleanFilter.province) {
        dispatch(handleFindUnits(cleanFilter, !support || onSelectChanged));
      }
    }
  }, [filterType, address]);

  const columns = useMemo(() => {
    const cols = [
      {
        Header: 'Tên đơn vị',
        accessor: 'name',
        width: 600,
      },
    ];
    if (management) {
      cols.push({
        Header: ' ',
        accessor: 'id',
        // eslint-disable-next-line react/prop-types
        Cell: ({ cell: { value } }) => (
          <>
            <IconButton size="small" onClick={() => setShowUnit(value)}>
              <Icons.XEdit />
            </IconButton>
            {(admin || support) ? (
              <IconButton size="small" onClick={() => setRemoveUnit(value)}>
                <Icons.XBin stroke={colors.red[400]} />
              </IconButton>
            ) : null}
          </>
        ),
        action: true,
        width: 200,
        sticky: 'right',
      });
    }
    return cols;
  }, [management]);

  const data = useMemo(() => {
    const rows = [];
    const unitsLevel = unitTypesOptions?.[unit?.type ?? '']?.level ?? '';
    const filterLevel = unitTypesOptions?.[filterType]?.level ?? '';
    const filterUnits = admin ? Object.entries(units)
      : Object.entries(units).filter((e) => !e[1]?.removed);
    const acceptTypes = [filterType, ...(unitTypesOptions?.[filterType]?.expand ?? [])];
    filterUnits.forEach(([id, u]) => {
      if (acceptTypes.includes(u.type)) {
        let passed = true;
        switch (filterLevel) {
          case 'province':
            if (u.province !== address.province) passed = false;
            break;
          case 'district':
            if (u.province !== address.province) passed = false;
            if (!['province'].includes(unitsLevel) || address.district) {
              passed = passed && u.district === address.district;
            }
            break;
          case 'ward':
            if (u.province !== address.province) passed = false;
            if (u.district !== address.district) passed = false;
            if (!['province', 'district'].includes(unitsLevel) || address.ward) {
              passed = passed && u.ward === address.ward;
            }
            break;
          default:
        }
        if (passed) {
          rows.push({
            id,
            ...u,
          });
        }
      }
    });
    return rows;
  }, [units, filterType, address]);

  return (
    <Dialog
      maxWidth="md"
      fullWidth
      open
      onClose={onClose}
    >
      <DialogTitle
        onClose={onClose}
        title="Danh Sách Đơn Vị"
      />
      <DialogContent dividers>
        {handling ? <Waiting fullscreen /> : null}
        {removeUnit ? (
          <Confirmation
            onClose={() => setRemoveUnit()}
            severity="warning"
            description="Sau khi xóa thì sẽ không thể khôi phục lại được."
            primaryAction={() => {
              if (admin) {
                dispatch(handleUpdateUnit(removeUnit, null, () => setRemoveUnit()));
              } else {
                const updateContent = {
                  ...units?.[removeUnit],
                  removed: true,
                };
                dispatch(handleUpdateUnit(removeUnit, updateContent, () => setRemoveUnit()));
              }
            }}
          />
        ) : null}
        {(showUnit !== undefined) ? (
          <Unit
            onClose={() => setShowUnit()}
            unitId={showUnit}
          />
        ) : null}
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <AutoComplete
              value={filterType || null}
              options={Object.keys(unitTypesOptions)}
              getOptionLabel={(value) => unitTypesOptions?.[value]?.name}
              onChange={(e, value) => setFilterType(value)}
              inputProps={{
                label: 'Loại Đơn Vị',
                required: true,
              }}
            />
          </Grid>
          {filterType ? (
            <Grid item xs={12}>
              <Address
                onChange={(value) => setAddress(value)}
                level={unitTypesOptions?.[filterType]?.level ?? ''}
                value={address}
              />
            </Grid>
          ) : null}
          <Grid item xs={12}>
            <Box width={910}>
              {data.length ? (
                <Table
                  initialState={{
                    selectedRowIds: selecting,
                  }}
                  onSelect={setSelecting}
                  columns={columns}
                  data={data}
                  height={350}
                  disableFilters
                  disableGroupBy
                  getRowId={(row) => row.id}
                  width={900}
                  rowHeight={56}
                />
              )
                : (
                  <Box
                    height={350}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Typography>Chưa có danh sách đơn vị, vui lòng thêm/ chọn đơn vị</Typography>
                  </Box>
                )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        {management ? (
          <Button
            color="secondary"
            onClick={() => setShowUnit('')}
          >
            Thêm đơn vị
          </Button>
        ) : null}
        {onSelectChanged ? (
          <Button
            color="primary"
            onClick={() => {
              const pending = [];
              Object.entries(selecting).forEach(([unitId, state]) => {
                if (state) pending.push(unitId);
              });
              onSelectChanged(pending);
              onClose();
            }}
          >
            Tiếp tục
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  );
}

Units.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSelectChanged: PropTypes.func,
  selected: PropTypes.arrayOf(PropTypes.string),
  management: PropTypes.bool,
};

Units.defaultProps = {
  onSelectChanged: undefined,
  selected: [],
  management: false,
};

export default Units;
