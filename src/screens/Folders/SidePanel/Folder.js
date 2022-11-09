import React, { useEffect, useMemo, useState } from 'react';

import {
  TreeItem,
  Box,
  Typography,
  Chip,
} from '@xbotvn/react-ui/core';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';

import { Icons } from '../../../components';
import * as Styles from '../styles';
import ReportsUnits from './ReportsUnits';
import SharesUnits from './SharesUnits';

function Folder({
  id,
  name,
  folders,
  shares,
  reports,
  showUnitsCount,
  showReportUnit,
}) {
  const [showUnits, setShowUnits] = useState();
  const {
    children,
    rest,
  } = useMemo(() => ({
    children: Object.values(folders).filter(({ parent }) => parent === id),
    rest: Object.values(folders).filter(({ id: fid }) => fid !== id),
  }), [id, folders, reports]);

  const panel = useMemo(() => {
    const props = {
      onClose: () => setShowUnits(),
      folderId: id,
    };
    switch (showUnits) {
      case 'shares':
        return <SharesUnits {...props} />;
      case 'reports':
        return <ReportsUnits {...props} />;
      default:
        return null;
    }
  }, [showUnits]);

  useEffect(() => {
    ReactTooltip.rebuild();
  }, [showUnitsCount]);

  return (
    <>
      {panel}
      <TreeItem
        nodeId={id}
        label={(
          <Box display="flex" alignItems="flex-start">
            {(name || '').length > 40 ? (
              <ReactTooltip
                id={id} place="right"
                isCapture
              />
            ) : null}
            <Styles.TitleFolder data-for={id} data-tip={name}>
              {name}
            </Styles.TitleFolder>
            {(shares.length && showUnitsCount) ? (
              <>
                <Chip
                  color="primary"
                  size="small"
                  data-tip
                  data-for={`${id}_sharesUnitCount`}
                  label={shares.length}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUnits('shares');
                  }}
                />
                <ReactTooltip id={`${id}_sharesUnitCount`} type="info" place="bottom">
                  <Typography variant="body1">Số đơn vị chia sẻ</Typography>
                </ReactTooltip>
              </>
            ) : null}
            {(showReportUnit && reports.length && showUnitsCount) ? (
              <>
                <Styles.BtnReportUnit
                  data-tip
                  startIcon={<Icons.XManagerList />}
                  data-for={`${id}_reportUnitCount`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUnits('reports');
                  }}
                >
                  <Icons.XManagerList />
                </Styles.BtnReportUnit>
                <ReactTooltip id={`${id}_reportUnitCount`} type="info" place="bottom">
                  <Typography variant="body1">Thống kê tiến độ nộp báo cáo</Typography>
                </ReactTooltip>
              </>
            ) : null}
          </Box>
        )}
      >
        {children.map(({
          id: fid,
          name: label,
          shares: childShares,
          reports: childReports,
        }) => (
          <Folder
            key={fid}
            shares={childShares}
            reports={childReports}
            id={fid}
            name={label}
            folders={rest}
            showUnitsCount={showUnitsCount}
            showReportUnit={showUnitsCount}
          />
        ))}
      </TreeItem>
    </>
  );
}

Folder.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  folders: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    parent: PropTypes.string.isRequired,
  })).isRequired,
  shares: PropTypes.arrayOf(PropTypes.string),
  reports: PropTypes.arrayOf(PropTypes.string),
  showUnitsCount: PropTypes.bool,
  showReportUnit: PropTypes.bool,
};

Folder.defaultProps = {
  shares: [],
  reports: [],
  showUnitsCount: false,
  showReportUnit: true,
};

export default Folder;
