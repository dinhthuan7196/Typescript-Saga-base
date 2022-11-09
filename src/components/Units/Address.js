import React from 'react';

import { AutoComplete } from '@xbotvn/react-ui/components';
import { Grid } from '@xbotvn/react-ui/core';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

function Address({
  onChange,
  level,
  value,
}) {
  const {
    cities,
    support,
  } = useSelector(({ catalogs, user }) => ({
    unitsLevel: catalogs.system?.product?.data?.config?.unitTypes?.[user?.unit?.type ?? '']?.level ?? '',
    support: user?.account?.xbot?.support ?? false,
    cities: catalogs?.system?.cities?.data ?? {},
  }));

  const { province, district, ward } = value;
  return (
    <Grid container spacing={1}>
      <Grid item xs={4}>
        <AutoComplete
          value={province || null}
          fullWidth
          disabled={!support}
          options={Object.keys(cities)}
          getOptionLabel={(val) => cities?.[val]?.name ?? val}
          onChange={(e, val) => onChange({ province: val, district: '', ward: '' })}
          inputProps={{
            label: 'Tỉnh/Thành',
            required: true,
            placeholder: 'Chọn Tỉnh/Thành',
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <AutoComplete
          value={district || null}
          fullWidth
          disabled={level === 'province'}
          options={Object.keys(cities?.[province]?.districts ?? {})}
          getOptionLabel={(val) => cities?.[province]?.districts?.[val]?.name ?? val}
          onChange={(e, val) => onChange({ province, district: val, ward: '' })}
          inputProps={{
            label: 'Quận/Huyện',
            required: true,
            placeholder: 'Chọn Quận/Huyện',
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <AutoComplete
          value={ward || null}
          fullWidth
          disabled={['province', 'district'].includes(level)}
          options={Object.keys(cities?.[province]?.districts?.[district]?.wards ?? {})}
          getOptionLabel={
            (val) => cities?.[province]?.districts?.[district]?.wards?.[val]?.name ?? val
          }
          onChange={(e, val) => onChange({ province, district, ward: val })}
          inputProps={{
            label: 'Phường/Xã',
            required: true,
            placeholder: 'Chọn Phường/Xã',
          }}
        />
      </Grid>
    </Grid>
  );
}

Address.propTypes = {
  onChange: PropTypes.func.isRequired,
  level: PropTypes.string.isRequired,
  value: PropTypes.shape({
    province: PropTypes.string,
    district: PropTypes.string,
    ward: PropTypes.string,
  }).isRequired,
};

export default Address;
