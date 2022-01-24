import axios from 'axios';

const axiosInstance = (config?: any) => {
  const options = {
    ...config,
  };
  return axios.create(options);
};

export default axiosInstance
