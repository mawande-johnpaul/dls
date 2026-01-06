import axios from 'axios';
var backend  = 'https://dls-production-37a3.up.railway.app/';

export async function fetchData(endpoint, method, data=null) {
    if (method == 'GET') {
        const response = await axios.get(backend + endpoint + '/');
        return response.data;
    }
    else if (method == 'POST') {
        const response = await axios.post(backend + endpoint + '/', data);
        return response.data;
    }
    else if (method == 'PUT') {
        const response = await axios.put(backend + endpoint + '/', data);
        return response.data;
    }
    else if (method == 'DELETE') {
        const response = await axios.delete(backend + endpoint + '/');
        return response.data;
    }
}