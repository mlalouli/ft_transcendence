import {ToastContainer } from 'react-bootstrap';
import Toast from 'react-bootstrap/Toast';

const getTime = () => {
    
    let newDate = new Date();
    const time = newDate.getHours() + 'h' + newDate.getMinutes();
    return time;
}

export const TAlert = (props: any) => {
    return (
        <ToastContainer  style={{zIndex: 2000,
                                 position: 'fixed',
                                 top: '20px',
                                 left:'150px',
                                 }}>
            <Toast onClose={() => props.setShow(false)}
                   show = {props.show}
                   delay = {5000}
                   autohide
                   style={{ fontSize: '1.2em' }}
            >
                <Toast.Header>
              
                <strong > Notification Alert </strong>
                <small>{getTime()}</small>
                </Toast.Header>
                <Toast.Body  style={{ color: 'black', padding: '1em' }}>{props.text}</Toast.Body>
            </Toast>
        </ToastContainer>  
    )
}