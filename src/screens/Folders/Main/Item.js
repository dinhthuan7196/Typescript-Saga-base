import React, { useMemo } from 'react';

import {
  Chip,
  SvgIcon,
} from '@xbotvn/react-ui/core';
import { formatDistanceToNow, format } from '@xbotvn/utils/date';
import { formatBytes } from '@xbotvn/utils/string';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import Row from './Row';

function Item({
  type,
  name,
  created,
  modified,
  size,
  labels,
  expire,
  extend,
}) {
  const unitID = useSelector((stock) => stock?.user?.unit?.id ?? '');

  const icon = useMemo(() => {
    switch (type) {
      case 'folder':
        return (
          <SvgIcon viewBox="0 0 24 24">
            <path
              d="M19 6.94H12.529C12.3654 6.94009 12.2042 6.90001 12.0597 6.8233C11.9151 6.74658 11.7916 6.63557 11.7 6.5L10.3 4.437C10.208 4.30199 10.0844 4.19156 9.93986 4.11538C9.79534 4.0392 9.63436 3.99959 9.471 4H5C4.46957 4 3.96086 4.21072 3.58579 4.58579C3.21071 4.96086 3 5.46957 3 6V18C3 18.5304 3.21071 19.0391 3.58579 19.4142C3.96086 19.7893 4.46957 20 5 20H19C19.5304 20 20.0391 19.7893 20.4142 19.4142C20.7893 19.0391 21 18.5304 21 18V8.94C21 8.40957 20.7893 7.90086 20.4142 7.52579C20.0391 7.15072 19.5304 6.94 19 6.94V6.94Z"
              stroke="#382E4D"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 9.88H9.471C9.63386 9.87993 9.79423 9.84008 9.93818 9.76392C10.0821 9.68776 10.2053 9.5776 10.297 9.443L11.697 7.378C11.7887 7.24308 11.912 7.13264 12.0561 7.05629C12.2002 6.97995 12.3609 6.94002 12.524 6.94"
              stroke="#382E4D"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </SvgIcon>
        );
      case 'file':
        return (
          <SvgIcon viewBox="0 0 24 24">
            <path
              d="M18.414 6.414L15.586 3.586C15.211 3.2109 14.7024 3.00011 14.172 3H7C6.46957 3 5.96086 3.21071 5.58579 3.58579C5.21071 3.96086 5 4.46957 5 5V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7.828C18.9999 7.29761 18.7891 6.78899 18.414 6.414V6.414Z"
              stroke="#191423"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 8H15C14.7348 8 14.4804 7.89464 14.2929 7.70711C14.1054 7.51957 14 7.26522 14 7V3"
              stroke="#191423"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </SvgIcon>
        );
      case 'report':
        return null;
      default:
        return null;
    }
  }, [type]);

  const deadline = useMemo(() => {
    if (extend[unitID]) return extend[unitID];
    if (expire) return expire;
    return '';
  }, [expire, extend]);

  return (
    <Row
      icon={icon}
      name={name}
      created={created?.user ?? ''}
      modified={modified?.time ? formatDistanceToNow(modified.time) : ''}
      expire={deadline ? format(deadline) : ''}
      size={formatBytes(size)}
      labels={labels.map((label, idx) => (
        <Chip
          label={label}
          key={idx}
        />
      ))}
    />
  );
}

Item.propTypes = {
  type: PropTypes.oneOf([
    'folder',
    'file',
    'report',
  ]).isRequired,
  name: PropTypes.string.isRequired,
  created: PropTypes.shape({
    user: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
  }),
  modified: PropTypes.shape({
    user: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
  }),
  size: PropTypes.number,
  labels: PropTypes.arrayOf(PropTypes.string),
  expire: PropTypes.string,
  extend: PropTypes.object,
};

Item.defaultProps = {
  created: {},
  modified: {},
  size: 0,
  labels: [],
  expire: '',
  extend: {},
};

export default Item;
