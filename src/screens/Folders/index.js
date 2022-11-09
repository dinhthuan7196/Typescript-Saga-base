/* eslint-disable max-len */
import React, { useState, useCallback, useMemo } from 'react';

import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
} from '@xbotvn/react-ui/core';
import { debounce } from '@xbotvn/utils/helpers';
import { useParams } from 'react-router-dom';

import Main from './Main';
import SidePanel from './SidePanel';

function Folders() {
  const params = useParams();
  const {
    unit,
    folder,
  } = params || {};

  const [windowSize, setWindowSize] = useState({
    height: window.innerHeight - 114,
    width: window.innerWidth,
  });
  const [isOpen, setIsOpen] = useState(window.location.host === 'fbot.xbot.com.vn');

  const updateWindowSize = useCallback(debounce((newSize) => setWindowSize(newSize)), []);

  window.addEventListener('resize', () => updateWindowSize({
    height: window.innerHeight - 114,
    width: window.innerWidth,
  }));

  const renderNotification = useMemo(() => {
    if (!isOpen) return null;
    return (
      <Dialog
        open
        fullWidth
        maxWidth="md"
        onClose={() => setIsOpen(false)}
      >
        <DialogTitle title="THÔNG BÁO THAY ĐỔI ĐƯỜNG DẪN VÀO PHẦN MỀM" onClose={() => setIsOpen(false)} />
        <DialogContent>
          <Typography variant="subtitle2">Nhằm đem đến cho người dùng những trải nghiệm tốt nhất, chúng tôi đã thực hiện nâng cấp phần mềm (dựa trên yêu cầu trực tiếp và các nội dung được tổng hợp từ CSKH). Do đó, để tương thích với sự nâng cấp và nhận được sự hỗ trợ tốt nhất, Anh/Chị vui lòng:</Typography>
          <Typography variant="subtitle2">
            Đăng nhập và sử dụng phần mềm tại đường dẫn mới:
            {' '}
            <a href="https://fbot.esoft.edu.vn">https://fbot.esoft.edu.vn</a>
          </Typography>
          <Typography variant="subtitle2">Lưu ý: tài khoản đăng nhập, các thông tin về phân quyền và dữ liệu hiện có sẽ không bị thay đổi.</Typography>
          <Typography variant="subtitle2">
            Đường dẫn hiện tại
            (
            <a href="fbot.xbot.com.vn">fbot.xbot.com.vn</a>
            )
            sẽ dừng hoạt động vào ngày 31/08/2021. Sau thời gian này, anh/chị sẽ không thể truy cập được nữa.
          </Typography>
          <Typography variant="subtitle2">Xin chân thành cảm ơn!</Typography>
        </DialogContent>
      </Dialog>
    );
  }, [isOpen]);

  return (
    <>
      {renderNotification}
      <Box display="flex" height={windowSize.height}>
        <SidePanel
          folderId={folder}
          windowSize={windowSize}
        />
        <Main
          folderId={folder}
          unitId={unit}
          windowSize={windowSize}
        />
      </Box>
    </>
  );
}

export default Folders;
