const axios = require('axios');

const adminSecretKey = 'YOUR_ADMIN_SECRET_KEY'; // Replace with your actual admin secret key
const apiUrl = 'https://intent-kit-16.hasura.app/api/rest/blogs';

const config = {
  headers: {
    'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6',
  },
};

axios.get(apiUrl, config)
  .then((response) => {
    // Handle the response data here
    console.log(response.data);
  })
  .catch((error) => {
    // Handle any errors here
    console.error('Error fetching data:', error.message);
  });