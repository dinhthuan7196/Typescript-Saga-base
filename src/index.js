import React from 'react';

import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';

import App from './App';
import rootSaga from './redux/actions';
import reducer from './redux/reducers';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import './peculiar.css';
import './styles.css';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; //eslint-disable-line
const sagaMiddleware = createSagaMiddleware();
const store = createStore(reducer, composeEnhancers(applyMiddleware(sagaMiddleware)));
sagaMiddleware.run(rootSaga);

ReactDOM.render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('root'));

const configuration = {
  onUpdate: (registration) => {
    if (registration && registration.waiting) {
      // eslint-disable-next-line no-alert
      if (window.confirm('Đã có bản mới! Thầy/Cô vui lòng ấn nút OK để cập nhật.')) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  },
};
serviceWorkerRegistration.register(configuration);
