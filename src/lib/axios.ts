import Axios from 'axios';

const axios = Axios.create({
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

export default axios;   