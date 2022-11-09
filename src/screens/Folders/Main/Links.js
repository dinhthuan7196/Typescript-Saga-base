import React, { useMemo, useState } from 'react';

import {
  Breadcrumbs,
  Box,
  Typography,
  MenuItem,
  Button,
  Chip,
  Link,
} from '@xbotvn/react-ui/core';
import { colors } from '@xbotvn/react-ui/styles';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { Icons, UsersLogs } from '../../../components';
import { handleQueryFiles } from '../../../redux/actions/files';
import { handleChangeYear } from '../../../redux/actions/folders';
import { traceToRoot } from '../utils';
import * as Styled from './styles';

function Links({
  folderId,
  unitId,
}) {
  const history = useHistory();
  const currentYear = new Date().getFullYear();
  const dispatch = useDispatch();
  const {
    year,
    unit,
    units,
    search,
    funits,
    folders,
    folder,
    usersUnit,
    connectors,
  } = useSelector(({
    folders: foldersStore,
    user,
    units: unitsStore,
    catalogs,
    files: filesStore,
  }) => ({
    year: foldersStore?.year ?? currentYear,
    unit: foldersStore?.units?.[unitId] ?? {},
    units: unitsStore?.data ?? {},
    search: filesStore.search ?? {},
    funits: foldersStore?.units ?? {},
    folders: foldersStore?.data ?? {},
    folder: foldersStore?.data?.[folderId] ?? {},
    usersUnit: user?.unit ?? {},
    connectors: catalogs?.system?.product?.data?.config?.connectors ?? [],
  }));

  const [showLogs, setShowLogs] = useState(false);

  const years = useMemo(() => [...Array(5).keys()].map((offset) => ({
    value: currentYear - offset,
    text: `${currentYear - offset}`,
  })), []);

  const links = useMemo(() => {
    const isShared = (folder?.shares ?? []).includes(usersUnit.id);
    const isReports = (folder?.reports ?? []).includes(usersUnit.id);
    const unitRoot = connectors.includes(folderId) ? folderId : usersUnit.id;
    const paths = traceToRoot(folderId, folders).map(
      ({ id, name }) => ({
        text: name,
        href: `/folders/${(isShared || isReports || connectors.includes(folder.unit)) ? folder.unit : unitRoot}/${id}`,
      }),
    );
    if (folder.unit === usersUnit.id || folderId === 'unit') {
      if (unitId !== usersUnit.id) {
        return [
          {
            text: 'Đơn vị',
            href: `/folders/${usersUnit.id}/unit`,
          },
          ...paths,
          {
            text: funits?.[unitId]?.name ?? (units?.[unitId]?.name ?? unitId),
          },
        ];
      }
      return [
        {
          text: 'Đơn vị',
          href: `/folders/${usersUnit.id}/unit`,
        },
        ...paths,
      ];
    }
    if (isShared) {
      return [
        { text: 'Danh sách đơn vị' },
        { text: unit.name },
        ...paths,
      ];
    }
    if (isReports) {
      return [
        { text: 'Được phân công' },
        { text: unit.name },
        ...paths,
      ];
    }
    if (connectors.includes(folder.unit)) {
      return [
        {
          text: folder.unit.toUpperCase(),
          href: `/folders/${folder.unit}/${folder.unit}_root`,
        },
        ...paths,
      ];
    }
    return [];
  }, [folders, folder, unit]);

  return (
    <Box
      display="flex"
      alignItems="baseline"
      p={2}
      height={50}
      bgcolor="white"
    >
      {showLogs ? (
        <UsersLogs
          onClose={() => setShowLogs(false)}
          type="folder"
          id={folderId}
        />
      ) : null}
      {search.query ? (
        <Chip
          color="primary"
          label={search.query}
          onDelete={() => dispatch(handleQueryFiles(''))}
        />
      )
        : (
          <>
            <Box flexGrow={1}>
              <Breadcrumbs
                itemsBeforeCollapse={0}
                maxItems={3}
              >
                {links.map(({ text, href }, idx) => {
                  if (href) {
                    return (
                      <Link
                        key={idx}
                        component="button"
                        onClick={() => {
                          history.push(href);
                        }}
                        color={((idx + 1) === links.length) ? 'primary' : 'inherit'}
                      >
                        <Typography variant="h6" style={{ fontWeight: 'bold' }}>{text}</Typography>
                      </Link>
                    );
                  }
                  return <Link key={idx} color={((idx + 1) === links.length) ? 'primary' : 'inherit'}><Typography variant="h6" style={{ fontWeight: 'bold' }}>{text}</Typography></Link>;
                })}
              </Breadcrumbs>
            </Box>
            {folder.storeType !== 'permanent' ? (
              <Styled.GroupButton
                color="secondary"
                size="small"
                startIcon={(
                  <Icons.XCalendar stroke={colors.primary[400]} fill={colors.primary[50]} />
                )}
              >
                <Styled.SelectTitle>Thời gian</Styled.SelectTitle>
                <Styled.SelectYear
                  value={year}
                  onChange={(e) => dispatch(handleChangeYear(e.target.value, folderId))}
                  style={{
                    color: colors.primary[400],
                  }}
                  disableUnderline
                  variant="standard"
                >
                  {years.map(({ text, value }) => (
                    <MenuItem
                      key={value}
                      value={value}
                    >
                      {text}
                    </MenuItem>
                  ))}
                </Styled.SelectYear>
              </Styled.GroupButton>
            ) : null}
            <Button
              color="secondary"
              size="small"
              startIcon={<Icons.XClock stroke={colors.primary[400]} fill={colors.primary[50]} />}
              onClick={() => setShowLogs(true)}
            >
              Lịch sử
            </Button>
          </>
        )}
    </Box>
  );
}

Links.propTypes = {
  folderId: PropTypes.string.isRequired,
  unitId: PropTypes.string.isRequired,
};

export default Links;
