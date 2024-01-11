import React, { Component } from 'react';
import Web3 from 'web3';
import Marketplace from '../abis/Marketplace.json';
import Navbar from './Navbar';
import Main from './Main';
import Login from './Login';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      productCount: 0,
      products: [],
      loading: true,
      isLoggedIn: false,
    };

    this.createProduct = this.createProduct.bind(this);
    this.purchaseProduct = this.purchaseProduct.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
  }

  async componentWillMount() {
    if (this.state.isLoggedIn) {
      await this.loadWeb3();
      await this.loadBlockchainData();
    }
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  async loadBlockchainData() {
    try {
      const web3 = window.web3;

      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      this.setState({ account });

      const networkId = await web3.eth.net.getId();
      const networkData = Marketplace.networks[networkId];

      if (networkData) {
        const marketplace = new web3.eth.Contract(Marketplace.abi, networkData.address);
        this.setState({ marketplace });

        const productCount = await marketplace.methods.productCount().call();
        this.setState({ productCount });

        const products = [];
        for (let i = 1; i <= productCount; i++) {
          const product = await marketplace.methods.products(i).call();
          products.push(product);
        }

        this.setState({ products, loading: false });
      } else {
        window.alert('Marketplace contract not deployed to detected network.');
      }
    } catch (error) {
      console.error(error);
      window.alert('Error loading blockchain data. Please check the console for details.');
      this.setState({ loading: false });
    }
  }

  createProduct = async (name, price) => {
    this.setState({ loading: true });
    try {
      await this.state.marketplace.methods.createProduct(name, price).send({ from: this.state.account })
        .once('receipt', (receipt) => {
          this.setState({ loading: false });
          window.location.reload(); // Refresh the page after adding a product
        });
    } catch (error) {
      console.error(error);
      this.setState({ loading: false });
      window.alert('Failed to create product. Please check the console for details.');
    }
  };

  purchaseProduct = async (id, price) => {
    this.setState({ loading: true });
    try {
      await this.state.marketplace.methods.purchaseProduct(id).send({ from: this.state.account, value: price })
        .once('receipt', (receipt) => {
          this.setState({ loading: false });
          window.location.reload(); // Refresh the page after purchasing a product
        });
    } catch (error) {
      console.error(error);
      this.setState({ loading: false });
      window.alert('Failed to purchase product. Please check the console for details.');
    }
  };

  handleLogin = async (account) => {
    this.setState({ isLoggedIn: true, account });
    await this.loadWeb3();
    await this.loadBlockchainData();
  };

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              {this.state.isLoggedIn ? (
                this.state.loading ? (
                  <div id="loader" className="text-center">
                    <p className="text-center">Loading...</p>
                  </div>
                ) : (
                  <Main
                    products={this.state.products}
                    createProduct={this.createProduct}
                    purchaseProduct={this.purchaseProduct}
                  />
                )
              ) : (
                <Login onLogin={this.handleLogin} />
              )}
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;