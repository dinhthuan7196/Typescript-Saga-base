import React, { useState, useMemo, useRef } from 'react';

import { Notification, Panel, Waiting } from '@xbotvn/react-ui/components';
import {
  TextField,
  MenuItem,
  Button,
  FormControl,
  IconButton,
  Icon,
  Box,
  Grid,
  Typography,
  SvgIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@xbotvn/react-ui/core';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { useSelector, useDispatch } from 'react-redux';
import SignatureCanvas from 'react-signature-canvas';

import { handleUserUpdate, handleUserSignOut } from '../../../redux/actions/user';
import Signature from '../../Signature';
import * as Styles from './styles';

const emptySignatureImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAAtJREFUGFdjYAACAAAFAAGq1chRAAAAAElFTkSuQmCC';

function ProfileForm({ onClose }) {
  const dispatch = useDispatch();
  const {
    email,
    displayName: name,
    phoneNumber: phone,
    male,
    signature: initSignature,
    handling,
  } = useSelector(({ user }) => user);
  const [displayName, setDisplayName] = useState(name || '');
  const [phoneNumber, setPhoneNumber] = useState(phone || '');
  const [gender, setGender] = useState(male ? 'M' : 'F');
  const [signature, setSignature] = useState(initSignature || '');
  const [createSignature, setCreateSignature] = useState();
  let canvasRef = useRef(null);

  const genderOptions = useMemo(
    () => [
      <MenuItem key="M" value="M">
        Nam
      </MenuItem>,
      <MenuItem key="F" value="F">
        Nữ
      </MenuItem>,
    ],
    [],
  );

  const renderCreateSignature = () => (
    <Dialog
      onClose={() => setCreateSignature()}
      open={createSignature}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle title="Tạo chữ ký" onClose={() => setCreateSignature()} />
      <DialogContent>
        <Styles.SignaturePadCotainer>
          <SignatureCanvas
            canvasProps={{ className: 'sigPad', width: 910, height: 400 }}
            ref={(ref) => { canvasRef = ref; }}
          />
        </Styles.SignaturePadCotainer>
      </DialogContent>
      <DialogActions>
        <Button
          startIcon={<Icon>redo</Icon>}
          onClick={() => canvasRef.clear()}
          color="secondary"
        >
          Đặt lại
        </Button>
        <Button
          color="primary"
          onClick={() => {
            if (canvasRef.getTrimmedCanvas().toDataURL('image/png') === emptySignatureImageData) {
              Notification.warn('Chưa tạo chữ ký');
              return;
            }
            setSignature(canvasRef.getTrimmedCanvas().toDataURL('image/png'));
            setCreateSignature();
          }}
          startIcon={(
            <SvgIcon viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.00703 2.25H7.99301H15.993H16.164C16.5252 2.25 16.8828 2.32117 17.2165 2.45945C17.5501 2.59772 17.8532 2.80039 18.1085 3.05586L20.9363 5.88359C21.452 6.39919 21.7419 7.09859 21.742 7.82784V19C21.742 19.7293 21.4523 20.4288 20.9366 20.9445C20.4208 21.4603 19.7214 21.75 18.992 21.75H17H7H5.11103C4.38525 21.75 3.68888 21.4631 3.17375 20.9518C2.65861 20.4406 2.36648 19.7464 2.36104 19.0206L2.25703 5.02062C2.25432 4.65778 2.32344 4.29792 2.46042 3.96191C2.5974 3.62588 2.79953 3.32028 3.05516 3.06273C3.3108 2.80518 3.61487 2.60078 3.94987 2.46129C4.28486 2.3218 4.64416 2.24999 5.00703 2.25ZM7.75 20.25H16.25V13.286C16.25 12.9898 16.0094 12.75 15.715 12.75H8.286C7.99021 12.75 7.75 12.9902 7.75 13.286V20.25ZM17.75 20.25V13.286C17.75 12.1622 16.8386 11.25 15.715 11.25H8.286C7.16179 11.25 6.25 12.1618 6.25 13.286V20.25H5.11101C4.78109 20.25 4.46456 20.1196 4.23041 19.8872C3.99627 19.6548 3.86348 19.3392 3.86099 19.0094L3.75699 5.00937C3.75576 4.84444 3.78717 4.68088 3.84944 4.52814C3.9117 4.3754 4.00358 4.23649 4.11978 4.11942C4.23597 4.00236 4.37419 3.90944 4.52646 3.84604C4.67873 3.78264 4.84205 3.75 5.00699 3.75H7.24301V6.909C7.24301 7.37313 7.42739 7.81825 7.75557 8.14644C8.08376 8.47463 8.52888 8.659 8.99301 8.659H14.993C15.4571 8.659 15.9023 8.47463 16.2304 8.14644C16.5586 7.81825 16.743 7.37313 16.743 6.909V3.89233C16.8551 3.95101 16.958 4.02655 17.0477 4.11633L19.8758 6.94441C20.1102 7.17874 20.2419 7.49673 20.242 7.82816V19C20.242 19.3315 20.1103 19.6495 19.8759 19.8839C19.6415 20.1183 19.3235 20.25 18.992 20.25H17.75ZM15.243 6.909V3.75H8.74301V6.909C8.74301 6.9753 8.76935 7.03889 8.81624 7.08578C8.86312 7.13266 8.92671 7.159 8.99301 7.159H14.993C15.0593 7.159 15.1229 7.13266 15.1698 7.08578C15.2167 7.03889 15.243 6.9753 15.243 6.909Z"
                fill="white"
              />
            </SvgIcon>
        )}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Panel
      anchor="right"
      open
      onClose={onClose}
      title="Thông Tin Tài Khoản"
      actions={(
        <Box display="flex" justifyContent="flex-end" width={1}>
          <Button
            style={{ marginRight: 10 }}
            color="secondary"
            onClick={() => dispatch(handleUserSignOut())}
          >
            Đăng Xuất
          </Button>
          <Button
            color="primary"
            onClick={() => {
              dispatch(
                handleUserUpdate(
                  {
                    displayName,
                    phoneNumber,
                    male: gender === 'M',
                    signature,
                  },
                  (err) => {
                    if (!err) onClose();
                  },
                ),
              );
            }}
            startIcon={(
              <SvgIcon viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.00703 2.25H7.99301H15.993H16.164C16.5252 2.25 16.8828 2.32117 17.2165 2.45945C17.5501 2.59772 17.8532 2.80039 18.1085 3.05586L20.9363 5.88359C21.452 6.39919 21.7419 7.09859 21.742 7.82784V19C21.742 19.7293 21.4523 20.4288 20.9366 20.9445C20.4208 21.4603 19.7214 21.75 18.992 21.75H17H7H5.11103C4.38525 21.75 3.68888 21.4631 3.17375 20.9518C2.65861 20.4406 2.36648 19.7464 2.36104 19.0206L2.25703 5.02062C2.25432 4.65778 2.32344 4.29792 2.46042 3.96191C2.5974 3.62588 2.79953 3.32028 3.05516 3.06273C3.3108 2.80518 3.61487 2.60078 3.94987 2.46129C4.28486 2.3218 4.64416 2.24999 5.00703 2.25ZM7.75 20.25H16.25V13.286C16.25 12.9898 16.0094 12.75 15.715 12.75H8.286C7.99021 12.75 7.75 12.9902 7.75 13.286V20.25ZM17.75 20.25V13.286C17.75 12.1622 16.8386 11.25 15.715 11.25H8.286C7.16179 11.25 6.25 12.1618 6.25 13.286V20.25H5.11101C4.78109 20.25 4.46456 20.1196 4.23041 19.8872C3.99627 19.6548 3.86348 19.3392 3.86099 19.0094L3.75699 5.00937C3.75576 4.84444 3.78717 4.68088 3.84944 4.52814C3.9117 4.3754 4.00358 4.23649 4.11978 4.11942C4.23597 4.00236 4.37419 3.90944 4.52646 3.84604C4.67873 3.78264 4.84205 3.75 5.00699 3.75H7.24301V6.909C7.24301 7.37313 7.42739 7.81825 7.75557 8.14644C8.08376 8.47463 8.52888 8.659 8.99301 8.659H14.993C15.4571 8.659 15.9023 8.47463 16.2304 8.14644C16.5586 7.81825 16.743 7.37313 16.743 6.909V3.89233C16.8551 3.95101 16.958 4.02655 17.0477 4.11633L19.8758 6.94441C20.1102 7.17874 20.2419 7.49673 20.242 7.82816V19C20.242 19.3315 20.1103 19.6495 19.8759 19.8839C19.6415 20.1183 19.3235 20.25 18.992 20.25H17.75ZM15.243 6.909V3.75H8.74301V6.909C8.74301 6.9753 8.76935 7.03889 8.81624 7.08578C8.86312 7.13266 8.92671 7.159 8.99301 7.159H14.993C15.0593 7.159 15.1229 7.13266 15.1698 7.08578C15.2167 7.03889 15.243 6.9753 15.243 6.909Z"
                  fill="white"
                />
              </SvgIcon>
            )}
          >
            Cập Nhật
          </Button>
        </Box>
      )}
    >
      {handling ? <Waiting fullscreen /> : null}
      {createSignature ? renderCreateSignature() : null}
      <Styles.CustomInput>
        <Box width={500} m={2}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Email"
                fullWidth
                defaultValue={email}
                disabled
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Họ và Tên"
                required
                fullWidth
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={7}>
                  <TextField
                    label="Số Điện Thoại"
                    fullWidth
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    label="Giới Tính"
                    fullWidth
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    select
                    SelectProps={{}}
                    variant="outlined"
                  >
                    {genderOptions}
                  </TextField>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Typography variant="subtitle2" gutterBottom style={{ fontWeight: 'bold' }}>
                  Chữ Ký Điện Tử
                </Typography>

                {signature ? (
                  <Signature
                    onRemove={() => setSignature(null)}
                    signature={signature}
                  />
                )
                  : (
                    <>
                      <Dropzone
                        onDrop={(files) => {
                          if (files.length) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setSignature(reader.result);
                              setSignature(reader.result);
                            };
                            reader.readAsDataURL(files[0]);
                          }
                        }}
                        accept=".jpeg, .png, .jpg"
                      >
                        {({ getRootProps, getInputProps }) => (
                          <div {...getRootProps()}>
                            <input {...getInputProps()} />
                            <Button
                              color="primary"
                              variant="text"
                              style={{
                                border: '1px dashed #0083ff',
                                boxSizing: 'border-box',
                                borderRadius: '16px !important',
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '12px 16px',
                                height: 72,
                              }}
                            >
                              <IconButton>
                                <Icon color="primary">add</Icon>
                              </IconButton>
                              {' '}
                              Thêm Chữ Ký
                            </Button>
                          </div>
                        )}
                      </Dropzone>
                      <Button
                        className="create-signature"
                        onClick={() => setCreateSignature(true)}
                        startIcon={<Icon>draw</Icon>}
                        color="primary"
                      >
                        Tạo chữ ký
                      </Button>
                    </>
                  )}
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Styles.CustomInput>
    </Panel>
  );
}

ProfileForm.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default ProfileForm;
