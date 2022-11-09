/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback, useEffect } from 'react';

import { Notification } from '@xbotvn/react-ui/components';
import {
  Container,
  Box,
} from '@xbotvn/react-ui/core';
import { colors } from '@xbotvn/react-ui/styles';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { Icons } from '../../components';
import { RESOURCES, COMPANY } from '../../config';
import {
  app,
  googleProvider,
  microsoftProvider,
  facebookProvider,
} from '../../libs/firebase';
import * as Styles from './styles';

function Welcome() {
  const history = useHistory();
  const { email, unit, authorizing } = useSelector(({ user }) => user);

  useEffect(() => {
    if (!authorizing && email && unit?.id) {
      history.push(`/folders/${unit.id}/unit`);
    }
  }, [email, unit, authorizing]);

  const errorHandler = (error) => {
    if (!error) return;
    if (error.code === 'auth/account-exists-with-different-credential') {
      Notification.warn(
        'Địa chỉ email này đã được đăng nhập bằng hình thức đăng nhập khác.',
      );
    } else {
      Notification.warn(`Lỗi kết nối: ${error}`);
    }
  };

  const authWithGoogle = useCallback(() => {
    app
      .auth()
      .signInWithPopup(googleProvider)
      .catch((error) => {
        errorHandler(error);
      });
  }, []);
  const authWithMicrosoft = useCallback(() => {
    app
      .auth()
      .signInWithPopup(microsoftProvider)
      .catch((error) => {
        errorHandler(error);
      });
  }, []);
  const authWithFacebook = useCallback(() => {
    app
      .auth()
      .signInWithPopup(facebookProvider)
      .catch((error) => {
        errorHandler(error);
      });
  }, []);

  return (
    <Container>
      <Styles.Container>
        <div className="subContainer">
          <Styles.Logo
            src={`${RESOURCES}/${COMPANY}.png`}
            alt="logo"
          />
          <h1>Hệ thống quản trị</h1>
          <h1>
            và lưu trữ hồ sơ
            {' '}
            <strong>FBOT</strong>
          </h1>
          <Styles.DescriptionText>
            <p>Thực hiện quyết định 749/QĐ-TTg ngày 03/06/2020</p>
            <p>
              Phê duyệt Chương trình chuyển đổi số quốc gia đến năm 2025, định
              hướng đến năm 2030
            </p>
          </Styles.DescriptionText>
          <div className="introContainer">
            <p>
              Chỉ việc đăng nhập bằng tài khoản Gmail của bạn là mọi thứ đã sẵn
              sàng.
            </p>
            <ul>
              <li>Số hoá dữ liệu, văn bản ở cơ quan tổ chức</li>
              <li>Phân công phụ trách dữ liệu văn bản</li>
              <li>Duyệt hồ sơ trực tuyến</li>
              <li>Ký số định danh</li>
            </ul>
          </div>

          <span className="login-by">Đăng nhập bằng</span>
          <Box mt={2} mb={3} display="flex">
            <Styles.LoginButton
              onClick={authWithGoogle}
              background={colors.red[400]}
              hover={colors.red[500]}
              startIcon={<Icons.XGoogle stroke="white" fill={colors.red[400]} />}
            >
              Google
            </Styles.LoginButton>
            <Styles.LoginButton
              onClick={authWithFacebook}
              background={colors.purple[400]}
              hover={colors.purple[500]}
              startIcon={<Icons.XFacebook stroke="white" fill={colors.purple[400]} />}
            >
              Facebook
            </Styles.LoginButton>
            <Styles.LoginButton
              background={colors.blue[400]}
              hover={colors.blue[500]}
              onClick={authWithMicrosoft}
              startIcon={<Icons.XMicrosoft stroke="white" fill={colors.blue[400]} />}
            >
              Microsoft
            </Styles.LoginButton>
          </Box>
          <strong className="fail-login">Không đăng nhập được?</strong>
          <Styles.Information className="information">
            <div className="sub">
              {/* <Styles.IconContainer icon="lifesaver" color="#0ac2e4" /> */}
              <span>Chăm sóc khách hàng</span>
              <ul>
                <li>
                  <span>Hotline: </span>
                  <span color="red">028 7300 3588</span>
                </li>
                <li>
                  <span>Hành Chính - Kế Toán: </span>
                  <span>028 6679 7180</span>
                </li>
              </ul>
            </div>
            <div className="sub">
              {/* <Styles.IconContainer icon="time" color="#0ac2e4" /> */}
              <span>Thời gian làm việc</span>
              <ul>
                <li>
                  <span>T2 - T7: </span>
                  8h00 - 12h00
                </li>
                <li>
                  <span>T2 - T6: </span>
                  13h30 - 17h30
                </li>
              </ul>
            </div>
          </Styles.Information>
        </div>
      </Styles.Container>
    </Container>
  );
}

export default Welcome;
