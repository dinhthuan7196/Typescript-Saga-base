import React, { useMemo } from 'react';

import {
  TreeItem,
  Typography,
} from '@xbotvn/react-ui/core';
import { orderBy } from '@xbotvn/utils/collection';
import PropTypes from 'prop-types';

import Folder from './Folder';

function Folders({
  nodeId,
  label,
  folders,
  showUnitsCount,
  showReportUnit,
}) {
  const nodes = useMemo(() => orderBy(
    folders.filter(({ parent }) => !folders.find(({ id }) => id === parent)),
    ['name'],
    ['asc'],
  ).map((folder) => (
    <Folder
      key={folder.id}
      {...folder}
      folders={folders}
      showUnitsCount={showUnitsCount}
      showReportUnit={showReportUnit}
    />
  )), [folders, showUnitsCount]);

  return (
    <TreeItem
      nodeId={nodeId}
      label={<Typography>{label}</Typography>}
    >
      {nodes}
    </TreeItem>
  );
}

Folders.propTypes = {
  nodeId: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  folders: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    unit: PropTypes.string,
  })),
  showUnitsCount: PropTypes.bool,
  showReportUnit: PropTypes.bool,
};

Folders.defaultProps = {
  folders: [],
  showUnitsCount: false,
  showReportUnit: true,
};

export default Folders;
