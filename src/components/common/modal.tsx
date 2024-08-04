
import '../../styles/modal.css';
import { ModalProps } from './Dashboard';

function Modal(props: ModalProps) {
  const showHideClassName = props.show ? "modal display-block" : "modal display-none";

  return (
    <div className={showHideClassName}>
      <section className="modal-main">
        {props.children}
        <br/>
        <button type="button" onClick={props.handleClose}>
          Close
        </button>
      </section>
    </div>
  );
};

export default Modal