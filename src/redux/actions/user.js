import { Notification } from '@xbotvn/react-ui/components';
import { uniqBy } from '@xbotvn/utils/collection';
import {
  takeLatest,
  takeEvery,
  put,
  all,
  select,
} from 'redux-saga/effects';

import {
  auth,
  signedOut,
  graphQLCaller,
} from '../../libs/backend';
import { app } from '../../libs/firebase';
import { queryCatalogs } from './catalogs';
import { USER, SIGN_OUT, FOLDERS } from './constants';

export function* update(data = {}) {
  yield put({
    type: USER.update,
    ...data,
  });
}

export function* loadLiveSupport(user, unit) {
  const cities = (yield select())?.catalogs?.system?.cities?.data ?? {};
  window.fcWidget.init({
    token: 'a1e32696-ff15-47e3-a3ec-44c01ddf8f0c',
    host: 'https://wchat.freshchat.com',
    locale: 'vi',
    siteId: 'FBOT',
    tags: ['fbot'],
    firstName: 'Thầy/Cô',
    lastName: user.displayName,
    email: user.email,
    faqTags: {
      tags: ['fbot'],
      filterType: 'category',
    },
    config: {
      showFAQOnOpen: false,
      headerProperty: {
        hideChatButton: true,
        appName: 'FBOT',
      },
      content: {
        placeholders: {
          search_field: 'Tìm kiếm',
          reply_field: 'Trả lời',
          csat_reply: 'Nhập nội dung đánh giá...',
        },
        actions: {
          csat_yes: 'Có',
          csat_no: 'Không',
          push_notify_yes: 'Có',
          push_notify_no: 'Không',
          tab_faq: 'Câu hỏi thường gặp',
          tab_chat: 'Hỗ trợ',
          csat_submit: 'Gửi',
        },
        headers: {
          chat: 'Hỗ trợ trực tuyến',
          chat_help: 'Xin cám ơn thầy/cô đã sử dụng hệ thống FBOT',
          faq: 'Các câu hỏi thường gặp',
          faq_help: 'Thầy/Cô có thể tìm kiếm theo nội dung',
          faq_not_available: 'Không tìm thấy',
          faq_search_not_available: 'Không tìm thấy tài liệu nào có nội dung {{query}}',
          faq_useful: 'Tài liệu này có giúp ích gì cho thầy/cô không?',
          faq_thankyou: 'Cám ơn phản hồi của thầy/cô',
          faq_message_us: 'Góp ý',
          push_notification: 'Thầy/Cô có đồng ý hiện thông báo khi có tin nhắn đến?',
          csat_question: 'Câu hỏi của thầy/cô có được trả lời không??',
          csat_yes_question: 'Thầy/cô đánh giá như thế nào về thái độ chăm sóc?',
          csat_no_question: 'Công ty có thể cải thiện gì để hỗ trợ tốt thêm không?',
          csat_thankyou: 'Cám ơn đánh giá của thầy/cô',
          csat_rate_here: 'Gửi đánh giá',
          channel_response: {
            offline: 'Hiện không có nhân viên nào đang trực tổng đài. Thầy/Cô vui lòng để lại tin nhắn tại đây.',
            online: {
              minutes: {
                one: 'Thầy/Cô vui lòng đợi khoảng {!time!} phút',
                more: 'Thông thường sẽ mất khoảng {!time!} phút',
              },
              hours: {
                one: 'Thầy/Cô vui lòng đợi khoảng 1 tiếng',
                more: 'Thông thường sẽ mất khoảng {!time!} tiếng',
              },
            },
          },
        },
      },
    },
  });

  const gender = (user.gender === 'M') ? 'Thầy' : 'Cô';

  const province = cities?.[unit.province] ?? {};
  const district = province?.districts?.[unit.district] ?? {};
  const ward = district?.wards?.[unit.ward] ?? {};

  window.fcWidget.user.setProperties({
    firstName: gender,
    lastName: user.displayName,
    email: user.email,
    unit_name: unit?.name ?? '',
    unit_id: unit?.id ?? '',
    address: unit?.type ?? '',
    provinceName: province?.name ?? 'Không tìm thấy',
    districtName: district?.name ?? 'Không tìm thấy',
    wardName: ward?.name ?? 'Không tìm thấy',
    user_uid: user.uid,
    log_server: 'Unkown',
  });
}

function* userSignedIn(user) {
  const { email, uid } = user;
  const cachedUnits = localStorage.getItem(`cachedUnits_${uid}`);
  let tempCachedUnits = {};
  if (cachedUnits) tempCachedUnits = JSON.parse(cachedUnits);
  if (email) {
    try {
      const {
        account,
        information,
        units,
      } = yield auth(email, uid);
      const mergedUnits = uniqBy(units.concat(tempCachedUnits), 'id');
      const unit = Object.values(mergedUnits).find(({ id }) => id === information.activeUnit) || {};
      if (unit.id) {
        yield* update({
          uid,
          email,
          displayName: user?.displayName ?? email,
          photoURL: user?.photoURL ?? '',
          ...information,
          account,
          unit,
          units: mergedUnits,
          authorizing: false,
        });
        yield* queryCatalogs(unit.id);
        yield* loadLiveSupport(user, unit);
        yield put({
          type: FOLDERS.handlers.get,
          category: '',
        });
        yield put({
          type: FOLDERS.handlers.get,
          category: 'reports',
        });
        yield put({
          type: FOLDERS.handlers.get,
          category: 'shares',
        });
        const connectors = (yield select())?.catalogs?.system?.product?.data?.config?.connectors
          ?? [];
        const isXbotAccount = Object.values(account).some((value) => value);
        // eslint-disable-next-line no-restricted-syntax
        for (const connector of connectors) {
          if (unit[connector] && ((unit?.admins ?? []).includes(email) || isXbotAccount)) {
            yield put({
              type: FOLDERS.handlers.get,
              category: connector,
            });
          }
        }
      } else {
        Notification.warn(' Email của Thầy/Cô chưa được cấp quyền vào đơn vị. Thầy/Cô vui lòng liên hệ quản trị phụ trách phần mềm để được cấp quyền vào đơn vị. Mọi vướng mắc vui lòng liên hệ tổng đài CSKH 028 73003588 để được giải đáp. Trân trọng!', {
          autoClose: 10000,
        });
        yield put({
          type: USER.handlers.signOut,
        });
      }
    } catch ({ message }) {
      yield* update({ email, uid, authorizing: false });
      Notification.error(message);
    }
  } else {
    yield* update({ authorizing: false });
  }
}

function* userSignedOut() {
  yield app.auth().signOut();
  yield signedOut();
  yield put({
    type: SIGN_OUT,
  });
}

function* updateInformation({ information, onComplete }) {
  const {
    email,
    uid,
    male,
    phoneNumber,
    signature,
  } = (yield select())?.user ?? {};
  const activeUnit = information?.activeUnit;
  try {
    if (activeUnit) {
      yield graphQLCaller('users', `
      mutation updateUserInformation($uid: ID!, $information: UserInput!) {
        updateUserInformation(uid: $uid, information: $information)
      }
    `, {
        uid,
        information: {
          email,
          male,
          phoneNumber,
          signature,
          activeUnit,
        },
      });
      yield* update(information);
      Notification.success('Chuyển đơn vị thành công.', { action: onComplete });
    } else {
      yield graphQLCaller('users', `
      mutation updateUserInformation($uid: ID!, $information: UserInput!) {
        updateUserInformation(uid: $uid, information: $information)
      }
    `, {
        uid,
        information: {
          email,
          ...information,
        },
      });
      yield* update(information);
      Notification.success('Cập nhật thông tin tài khoản thành công.', { action: onComplete });
    }
  } catch ({ message }) {
    yield* update();
    Notification.error(message, { action: () => onComplete(message) });
  }
}

function* updateUnit({
  admins,
  staffs,
  groups,
  labels,
  onComplete,
}) {
  const { unit } = (yield select())?.user ?? {};
  if (!unit || !unit.id) yield* update();

  try {
    yield graphQLCaller('units', `
      mutation updateUnitInformation($id: ID!, $information: UnitInput!) {
        updateUnitInformation(id: $id, information: $information)
      }
    `, {
      id: unit.id,
      information: {
        admins,
        staffs: staffs.map(({ email }) => email),
        groups: Object.entries(groups).map(([id, values]) => ({
          id,
          ...values,
        })),
        labels,
      },
    });

    yield put({
      type: USER.unit,
      admins,
      staffs,
      groups,
      labels,
    });
    Notification.success('Cập nhật thành công.', { action: onComplete });
  } catch ({ message }) {
    Notification.error(message, { action: onComplete(message) });
    yield* update();
  }
}

export const handleUserUpdate = (information, onComplete) => ({
  type: USER.handlers.update,
  information,
  onComplete,
});

export const handleUserSignedIn = (user) => ({
  type: USER.handlers.login,
  ...user,
});

export const handleUserSignOut = () => ({
  type: USER.handlers.signOut,
});

export const handleUpdateUnit = (
  staffs,
  admins,
  groups,
  labels,
  onComplete,
) => ({
  type: USER.handlers.unit,
  staffs,
  admins,
  groups,
  labels,
  onComplete,
});

export const handleSwitchUnit = (information, onComplete) => ({
  type: USER.handlers.switch,
  information,
  onComplete,
});

export default function* saga() {
  yield all([
    yield takeLatest(USER.handlers.login, userSignedIn),
    yield takeLatest(USER.handlers.update, updateInformation),
    yield takeEvery(USER.handlers.signOut, userSignedOut),
    yield takeLatest(USER.handlers.unit, updateUnit),
    yield takeLatest(USER.handlers.switch, updateInformation),
  ]);
}
