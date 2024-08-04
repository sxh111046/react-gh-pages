import React, { Component } from "react";
import Modal from "./modal";

export interface ModalProps {
    handleClose: () => void;
    show: boolean;
    toggleShow?: () => void;
    children?: any;
}

class Dashboard extends Component {
    private params: ModalProps

  constructor(props: ModalProps) {
    super(props);
    this.params = props;
    this.state = {
      show: props.show
    };
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
  }

  toggleShow() {
    if(this.params.show) {
      this.hideModal();
    } else {
      this.showModal();
    }
  }

  showModal = () => {
    this.setState({ show: true });
  };

  hideModal = () => {
    this.setState({ show: false });
  };

  render() {
    return (
      <Modal {...this.params} />
    );
  }
}

export default Dashboard