import React, { Component } from 'react';

class Login extends Component {
    handleLogin = async () => {
        try {
          if (window.ethereum && window.ethereum.isMetaMask) {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            this.props.onLogin(account);
          } else {
            window.alert('MetaMask is not installed or not detected. Please install MetaMask to use this application.');
          }
        } catch (error) {
          console.error(error);
          window.alert('Failed to login with MetaMask. Please check the console for details.');
        }
      };

  render() {
    return (
      <div className="col-md-4 offset-md-4">
        <button onClick={this.handleLogin} className="btn btn-primary btn-block">
          Login with MetaMask
        </button>
      </div>
    );
  }
}

export default Login;
