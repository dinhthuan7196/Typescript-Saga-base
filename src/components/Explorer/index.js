import React, { useMemo, useState } from 'react';

import PropTypes from 'prop-types';

import { Icons } from '..';
import Folder from './Folder';
import * as Styles from './styles';

function Explorer({
  onSelectedChanged,
  selected,
  expanded: initExpanded,
  folders,
}) {
  const [expanded, setExpanded] = useState(initExpanded);

  const {
    root,
    rest,
  } = useMemo(() => {
    const tmp = {
      root: [],
      rest: [],
    };
    folders.forEach((folder) => {
      if ((folder.parent === 'unit') || !folders.find(({ id }) => id === folder.parent)) {
        tmp.root.push(folder);
      } else {
        tmp.rest.push(folder);
      }
    });
    return tmp;
  }, [folders]);

  return (
    <Styles.StyledTree
      defaultCollapseIcon={<Icons.XArrowTop />}
      defaultExpandIcon={<Icons.XArrowDown />}
      selected={selected}
      expanded={expanded}
      onNodeToggle={(e, nodeIds) => {
        setExpanded(nodeIds);
        e.preventDefault();
      }}
      onNodeSelect={(e, nodeId) => {
        onSelectedChanged(nodeId);
      }}
    >
      {root.map(({ id, name }) => (
        <Folder
          key={id}
          id={id}
          name={name}
          folders={rest}
        />
      ))}
    </Styles.StyledTree>
  );
}

Explorer.propTypes = {
  onSelectedChanged: PropTypes.func.isRequired,
  selected: PropTypes.string,
  expanded: PropTypes.arrayOf(PropTypes.string),
  folders: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    parent: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    unit: PropTypes.string,
  })),
};

Explorer.defaultProps = {
  selected: '',
  expanded: [],
  folders: [],
};

export default Explorer;
