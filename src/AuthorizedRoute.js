import React, { Component } from 'react';

import { Notification } from '@xbotvn/react-ui/components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, Redirect, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import { handleUserSignOut } from './redux/actions/user';

class AuthorizedRouter extends Component {
  render() {
    const { handleUserSignOut: handler, user, path } = this.props;
    // eslint-disable-next-line max-len
    const allow = user.email && (user?.account?.xbot?.support || (user?.unit?.staffs ?? []).find(({ email }) => email === user.email));
    if (allow) {
      return (
        <Route
          exact
          path={path}
          render={(props) => (<this.props.component {...props} />)}
        />
      );
    }
    if (user.email) {
      Notification.error('Tài khoản chưa được cấp quyền sử dụng phần mềm.');
      handler();
    }
    return (
      <Route
        exact
        path={path}
        render={(props) => (<Redirect to={{ pathname: '/welcome', state: { from: props.location } }} />)}
      />
    );
  }
}

AuthorizedRouter.propTypes = {
  handleUserSignOut: PropTypes.func.isRequired,
  user: PropTypes.shape({
    email: PropTypes.string,
    unit: PropTypes.shape({
      id: PropTypes.string.isRequired,
      staffs: PropTypes.arrayOf(PropTypes.shape({ email: PropTypes.string.isRequired })),
    }),
    account: PropTypes.shape({
      xbot: PropTypes.shape({
        support: PropTypes.bool,
      }),
    }),
  }).isRequired,
  path: PropTypes.string.isRequired,
};

const mapStateToProps = ({ user }) => ({
  user,
});
const mapDispatchToProps = (dispatch) => bindActionCreators({
  handleUserSignOut,
}, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AuthorizedRouter));
