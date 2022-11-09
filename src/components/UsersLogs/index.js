import React, { useEffect, useState } from 'react';

import { Notification, Waiting, Logs } from '@xbotvn/react-ui/components';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { graphQLCaller } from '../../libs/backend';

function UsersLogs({
  onClose,
  type,
  id,
}) {
  const unitId = useSelector(({ user }) => user?.unit?.id ?? '');

  const [logs, setLogs] = useState();

  useEffect(async () => {
    if (!unitId) {
      onClose();
      return;
    }
    try {
      const results = await graphQLCaller(
        'logs',
        `{
          logs(unitID: "${unitId}", type: "${type}", ref: "${id !== 'unit' ? id : ''}") {
            user
            message
            time
          }
        }`,
      );
      setLogs((results?.logs ?? []).map((log) => ({
        ...log,
        time: log.time ?? '',
      })));
    } catch ({ message }) {
      Notification.error(message);
      onClose();
    }
  }, []);

  return (
    <>
      {logs ? (
        <Logs
          open
          onClose={onClose}
          logs={logs}
        />
      ) : <Waiting />}
    </>
  );
}

UsersLogs.propTypes = {
  onClose: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

export default UsersLogs;
