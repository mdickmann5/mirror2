import axios from 'axios';
const KEY = 'AIzaSyAlphkY8i6T3Oik3uzn8wJD4PTAssXE4m4';

export default axios.create({
    baseURL: 'https://www.googleapis.com/youtube/v3/',
    params: {
        part: 'snippet',
        maxResults: 5,
        key: KEY
    }
})
