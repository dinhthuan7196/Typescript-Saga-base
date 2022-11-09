import React, { useState, useMemo } from 'react';

import {
  AppBar as UAppBar,
  Icon,
  IconButton,
  Avatar,
  Box,
  TextField,
  InputAdornment,
  Button,
} from '@xbotvn/react-ui/core';
import { colors } from '@xbotvn/react-ui/styles';
import { trim } from '@xbotvn/utils/string';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { RESOURCES, COMPANY } from '../../config';
import { handleQueryFiles } from '../../redux/actions/files';
import { handleSwitchUnit } from '../../redux/actions/user';
import * as Icons from '../Icons';
import Units from '../Units';
import Documents from './Documents';
import Profile from './Profile';
import * as Styles from './styles';
import Unit from './Unit';

function AppBar() {
  const {
    unit,
    email,
    account,
    photoURL,
    displayName,
    units,
    product,
    activeUnit,
  } = useSelector(({ user, catalogs }) => ({
    ...user,
    product: catalogs?.system?.product?.data ?? {},
  }));
  const history = useHistory();
  const dispatch = useDispatch();

  const [showDialog, setShowDialog] = useState();
  const [currentUnit, setCurrentUnit] = useState(activeUnit);
  const [search, setSearch] = useState('');

  const unitsOptions = useMemo(() => {
    const results = {};
    if (units) {
      units.forEach(({ id, name }) => {
        results[id] = name;
      });
    }
    return {
      ...results,
    };
  }, units);

  const dialog = useMemo(() => {
    const props = {
      onClose: () => setShowDialog(),
    };
    switch (showDialog) {
      case 'profile':
        return <Profile {...props} />;
      case 'unit':
        return <Unit {...props} />;
      case 'units':
        return <Units {...props} management />;
      case 'documents':
        return <Documents {...props} />;
      default:
        return null;
    }
  }, [showDialog]);

  const { isSupport, isStaff, isAdmin } = useMemo(() => ({
    isSupport: account?.xbot?.support ?? false,
    isStaff: (unit?.staffs ?? []).map((e) => e.email).includes(email),
    isAdmin: (unit?.admins ?? []).includes(email),
  }), [email, unit, account]);

  const handleChangeUnit = (id) => {
    const isValidId = units.find(({ id: unitId }) => unitId === id);
    if (isValidId && id !== activeUnit) {
      setCurrentUnit(id);
      dispatch(handleSwitchUnit(
        { activeUnit: id },
        () => window.location.reload(),
      ));
      history.push(`/folders/${id}/unit`);
    }
  };

  if (isStaff || isAdmin || isSupport) {
    return (
      <UAppBar position="static" style={{ boxShadow: 'none', background: 'white', margin: '12px 0' }}>
        {dialog}
        <Styles.StyledToolbar>
          <Box flexGrow={1} display="flex">
            <img
              style={{ width: 50, height: 'auto' }}
              src={`${RESOURCES}/${COMPANY}.png`}
              alt="logo"
            />
            {(unit && units) ? (
              <>
                <Styles.StyledAutocomplete
                  value={currentUnit}
                  options={Object.keys(unitsOptions)}
                  getOptionLabel={(value) => unitsOptions?.[value] ?? ''}
                  onChange={(e, value) => value && handleChangeUnit(value)}
                  inputProps={
                    {
                      variant: 'outlined',
                    }
                  }
                />
              </>
            ) : null}
            <TextField
              style={{ marginLeft: 20, marginRight: 20 }}
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm files"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon>search</Icon>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button variant="text" onClick={() => dispatch(handleQueryFiles(trim(search)))}>Tìm kiếm</Button>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          {(isSupport || isStaff) ? (
            <Button
              style={{ marginRight: 7 }}
              size="small"
              color="secondary"
              onClick={() => setShowDialog('documents')}
              startIcon={<Icon>book</Icon>}
            >
              Thư viện văn bản
            </Button>
          ) : null}
          {(isAdmin || isSupport) ? (
            <Button
              size="small"
              color="secondary"
              onClick={() => setShowDialog('unit')}
              startIcon={<Icons.XUser stroke={colors.primary[400]} />}
            >
              Quản trị
            </Button>
          ) : null}
          {product.guide ? (
            <Button
              variant="text"
              onClick={() => window.open(product.guide, 'Hướng dẫn sử dụng', 'location:no')}
              style={{ marginRight: 20 }}
              startIcon={<Icons.XBook />}
            >
              Sách Hướng Dẫn
            </Button>
          ) : null}
          {isSupport ? (
            <IconButton onClick={() => setShowDialog('units')}>
              <Icon color="error">admin_panel_settings</Icon>
            </IconButton>
          ) : null}
          <Avatar
            alt={displayName || email} src={photoURL || ''}
            onClick={() => setShowDialog('profile')}
            style={{ cursor: 'pointer', marginLeft: 8, marginRight: 10 }}
          />
        </Styles.StyledToolbar>
      </UAppBar>
    );
  }
  return null;
}

export default AppBar;
