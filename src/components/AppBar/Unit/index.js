import React, { useState, useMemo } from 'react';

import {
  Panel,
  Waiting,
  Confirmation,
  Notification,
} from '@xbotvn/react-ui/components';
import {
  Button,
  Box,
  Tabs,
  Tab,
  Container,
} from '@xbotvn/react-ui/core';
import { colors } from '@xbotvn/react-ui/styles';
import {
  cloneDeep,
  unset,
  set,
  uniq,
  getUniqueKey,
} from '@xbotvn/utils/collection';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

import { handleUpdateUnit } from '../../../redux/actions/user';
import * as Icons from '../../Icons';
import Staff from '../../Staff';
import Groups from './Groups';
import Group from './Groups/Group';
import Staffs from './Staffs';
import * as Styles from './styles';

function Unit({ onClose }) {
  const dispatch = useDispatch();
  const {
    staffs: initStaffs,
    admins: initAdmins,
    groups: initGroups,
    labels,
    handling,
  } = useSelector(({ user }) => ({
    staffs: user?.unit?.staffs ?? [],
    admins: user?.unit?.admins ?? [],
    groups: user?.unit?.groups ?? {},
    labels: user?.unit?.labels ?? [],
    handling: user?.handling ?? false,
  }));

  const [activeTab, setActiveTab] = useState('staffs');
  const [newStaff, setNewStaff] = useState(false);
  const [newGroup, setNewGroup] = useState(false);
  const [staffs, setStaffs] = useState(initStaffs);
  const [admins, setAdmins] = useState(initAdmins);
  const [groups, setGroups] = useState(initGroups);
  const [confirmation, setConfirmation] = useState();

  const action = useMemo(() => {
    const props = {
      color: 'secondary',
      style: { marginRight: 10 },
    };
    switch (activeTab) {
      case 'staffs':
        return (
          <Button
            {...props}
            onClick={() => setNewStaff(true)}
            startIcon={<Icons.XUser stroke={colors.primary[400]} />}
          >
            Thêm Nhân Sự
          </Button>
        );
      case 'groups':
        return (
          <Button
            {...props}
            onClick={() => setNewGroup(true)}
            startIcon={<Icons.XGroup stroke={colors.primary[400]} />}
          >
            Thêm Nhóm
          </Button>
        );
      default:
        return null;
    }
  }, [activeTab]);
  const content = useMemo(() => {
    switch (activeTab) {
      case 'staffs':
        return (
          <Staffs
            staffs={staffs}
            admins={admins}
            onChange={(email, admin) => {
              if (admin === undefined) {
                setStaffs((prevStaffs) => prevStaffs.filter(({ email: e }) => e !== email));
                setAdmins((prevAdmins) => prevAdmins.filter((e) => e !== email));
                setGroups((prevGroups) => {
                  const cloned = {};
                  Object.entries(prevGroups).forEach(([gid, values]) => {
                    cloned[gid] = {
                      name: values?.name ?? gid,
                      staffs: (values?.staffs ?? []).filter((e) => e !== email),
                    };
                  });
                  return cloned;
                });
              } else {
                setAdmins((prevAdmins) => {
                  const newAdmins = prevAdmins.filter((e) => e !== email);
                  if (admin) newAdmins.push(email);
                  return newAdmins;
                });
              }
            }}
          />
        );
      case 'groups':
        return (
          <Groups
            staffs={staffs}
            groups={groups}
            onChange={(gid, name, emails) => {
              setGroups((prevGroups) => {
                const cloned = cloneDeep(prevGroups);
                if (!name) unset(cloned, gid);
                else set(cloned, gid, ({ name, staffs: emails || [] }));
                return cloned;
              });
            }}
          />
        );
      default:
        return null;
    }
  }, [
    activeTab,
    staffs,
    admins,
    groups,
  ]);

  return (
    <Panel
      anchor="right"
      open
      onClose={onClose}
      title="Cấu Hình Đơn Vị"
      actions={(
        <Box display="flex" justifyContent="flex-end" width={1}>
          {action}
          <Button
            color="primary"
            onClick={() => {
              dispatch(handleUpdateUnit(
                staffs,
                admins,
                groups,
                labels,
                (err) => {
                  if (!err) onClose();
                },
              ));
            }}
            startIcon={<Icons.XSave stroke="white" />}
          >
            Cập Nhật
          </Button>
        </Box>
      )}
    >
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
                return [{ email, displayName: email }, ...prevStaffs];
              });
              if (admin) setAdmins((prevAdmins) => uniq([...prevAdmins, email]));
            }
            setNewStaff();
          }}
        />
      ) : null}
      {newGroup ? (
        <Group
          groups={groups}
          staffs={staffs.map(({ email }) => email)}
          onClose={(name, members = []) => {
            if (name) {
              setGroups((prevGroups) => ({
                ...prevGroups,
                [getUniqueKey(Object.keys(prevGroups))]: {
                  name,
                  staffs: members,
                },
              }));
            }
            setNewGroup();
          }}
        />
      ) : null}
      {confirmation ? (
        <Confirmation
          {...confirmation}
          severity="warning"
          onClose={() => setConfirmation()}
        />
      ) : null}

      <Box width={820}>
        <Styles.UnitContainer>
          <Tabs
            value={activeTab}
            onChange={(e, value) => setActiveTab(value)}
            indicatorColor={colors.primary[600]}
            textColor="primary"
            centered
          >
            <Tab label="Nhân Sự" value="staffs" />
            <Tab label="Nhóm" value="groups" />
          </Tabs>
          <Container style={{ marginTop: 20 }}>
            {content}
          </Container>
        </Styles.UnitContainer>
      </Box>
    </Panel>
  );
}

Unit.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default Unit;
