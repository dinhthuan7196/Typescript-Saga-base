import React from 'react';

import {
  SvgIcon,
  Typography,
  Select,
  Button,
} from '@xbotvn/react-ui/core';
import styled from 'styled-components';

export const NameColumn = styled.div`
  flex-grow: 1;
  min-width: 200px;
`;
export const CreatedColumn = styled.div`
  width: 200px;
`;
export const ModifiedColumn = styled.div`
  width: 180px;
`;
export const ExpireColumn = styled.div`
  width: 128px;
`;
export const SizeColumn = styled.div`
  width: 150px;
`;

export const Header = styled(Typography).attrs({ variant: 'subtitle2' })`
  font-weight: bold;
`;

export const FolderIcon = (
  <SvgIcon>
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

export const GroupButton = styled(Button)`
  margin-right: 15px !important;
  position: relative !important;
  width: 165px;
  top: -9px;
  height: 32px;
  padding: 4px 0px !important;
  .MuiButton-startIcon.MuiButton-iconSizeSmall {
    position: absolute;
    left: 12px;
  }
`;

export const SelectTitle = styled(Typography)`
  position: absolute;
  left: 35px;
`;

export const SelectYear = styled(Select)`
  border: none !important;
  height: 40px !important;
  background: transparent !important;
  position: absolute !important;
  width: 97%;
  left: 0;
  border-radius: 15px;
  text-align: end;
  .MuiSelect-select:focus {
    background: none !important;
  }
  .MuiSelect-select.MuiSelect-select {
    padding-top: 17px;
  }
`;
