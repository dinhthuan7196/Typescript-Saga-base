import Autocomplete from '@xbotvn/react-ui/components/AutoComplete';
import { Box, Toolbar } from '@xbotvn/react-ui/core';
import styled from 'styled-components';

export const GroupedItems = styled(Box).attrs({
  display: 'flex',
  alignItems: 'center',
})``;

export const StyledToolbar = styled(Toolbar)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  && {
    min-height: 40px;
  }
`;

export const StyledAutocomplete = styled(Autocomplete)`
  width: 270px;
  .PrivateNotchedOutline-root-3, .MuiOutlinedInput-notchedOutline {
    border: unset!important;
  }
  &.MuiInputBase-root {
    border: unset;
  }
  .MuiAutocomplete-clearIndicator {
    display: none;
  }
  .MuiFormControl-root, .MuiInputBase-root {
    border: none;
  }
  .MuiInputBase-input {
    font-size: 1rem;
    font-weight: bold;
  }
`;
